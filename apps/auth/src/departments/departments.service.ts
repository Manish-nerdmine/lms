import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from '@app/common/models/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private readonly departmentModel: Model<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check if department with same name already exists
    const existingDepartment = await this.departmentModel.findOne({ 
      name: createDepartmentDto.name 
    }).exec();
    
    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = new this.departmentModel(createDepartmentDto);
    return department.save();
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().sort({ name: 1 }).exec();
  }

  async findActive(): Promise<Department[]> {
    return this.departmentModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  async update(id: string, updateDepartmentDto: Partial<CreateDepartmentDto>): Promise<Department> {
    // Check if name is being updated and if it conflicts with existing department
    if (updateDepartmentDto.name) {
      const existingDepartment = await this.departmentModel.findOne({ 
        name: updateDepartmentDto.name,
        _id: { $ne: id }
      }).exec();
      
      if (existingDepartment) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    const department = await this.departmentModel
      .findByIdAndUpdate(id, updateDepartmentDto, { new: true })
      .exec();

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async remove(id: string): Promise<void> {
    const result = await this.departmentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Department not found');
    }
  }

  async updateEmployeeCount(id: string, count: number): Promise<Department> {
    const department = await this.departmentModel
      .findByIdAndUpdate(id, { employeeCount: count }, { new: true })
      .exec();

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async findByName(name: string): Promise<Department | null> {
    return this.departmentModel.findOne({ name }).exec();
  }
} 