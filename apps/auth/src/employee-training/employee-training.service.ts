import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeTraining } from '@app/common/models/employee-training.schema';
import { AssignTrainingDto } from './dto/assign-training.dto';

@Injectable()
export class EmployeeTrainingService {
    constructor(
        @InjectModel(EmployeeTraining.name)
        private readonly employeeTrainingModel: Model<EmployeeTraining>,
    ) { }

    async assignTraining(assignTrainingDto: AssignTrainingDto): Promise<EmployeeTraining> {
        const training = new this.employeeTrainingModel({
            ...assignTrainingDto,
            status: 'pending',
            progressPercentage: 0,
        });

        return await training.save();
    }

    async getEmployeeTrainings(employmentId: string): Promise<EmployeeTraining[]> {
        return await this.employeeTrainingModel
            .find({ employmentId })
            .populate('moduleId')
            .populate('assignedBy')
            .sort({ createdAt: -1 })
            .exec();
    }

    async getTodoTrainings(employmentId: string): Promise<EmployeeTraining[]> {
        return await this.employeeTrainingModel
            .find({
                employmentId,
                status: { $in: ['pending', 'in-progress'] },
            })
            .populate('moduleId')
            .populate('assignedBy')
            .sort({ dueDate: 1 })
            .exec();
    }

    async completeTraining(trainingId: string): Promise<EmployeeTraining> {
        const training = await this.employeeTrainingModel.findById(trainingId).exec();

        if (!training) {
            throw new NotFoundException('Training not found');
        }

        training.status = 'completed';
        training.completedAt = new Date();
        training.progressPercentage = 100;

        return await training.save();
    }

    async getModuleAssignments(moduleId: string): Promise<EmployeeTraining[]> {
        return await this.employeeTrainingModel
            .find({ moduleId })
            .populate('employmentId')
            .populate('assignedBy')
            .sort({ createdAt: -1 })
            .exec();
    }

    async updateProgress(
        trainingId: string,
        progressPercentage: number,
    ): Promise<EmployeeTraining> {
        const training = await this.employeeTrainingModel.findById(trainingId).exec();

        if (!training) {
            throw new NotFoundException('Training not found');
        }

        training.progressPercentage = progressPercentage;

        // Update status based on progress
        if (progressPercentage > 0 && progressPercentage < 100) {
            training.status = 'in-progress';
        } else if (progressPercentage === 100) {
            training.status = 'completed';
            training.completedAt = new Date();
        }

        return await training.save();
    }

    async updateTodoItem(
        trainingId: string,
        todoItemId: string,
        isCompleted: boolean,
    ): Promise<EmployeeTraining> {
        const training = await this.employeeTrainingModel.findById(trainingId).exec();

        if (!training) {
            throw new NotFoundException('Training not found');
        }

        const todoItem = training.todoList.find(item => item.id === todoItemId);

        if (!todoItem) {
            throw new NotFoundException('Todo item not found');
        }

        todoItem.isCompleted = isCompleted;
        todoItem.completedAt = isCompleted ? new Date() : undefined;

        // Calculate progress based on completed todo items
        const completedCount = training.todoList.filter(item => item.isCompleted).length;
        const totalCount = training.todoList.length;
        training.progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Update status
        if (training.progressPercentage > 0 && training.progressPercentage < 100) {
            training.status = 'in-progress';
        } else if (training.progressPercentage === 100) {
            training.status = 'completed';
            training.completedAt = new Date();
        }

        return await training.save();
    }
}
