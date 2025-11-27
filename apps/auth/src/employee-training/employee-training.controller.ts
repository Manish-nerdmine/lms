import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { EmployeeTrainingService } from './employee-training.service';
import { AssignTrainingDto } from './dto/assign-training.dto';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('employee-training')
@Controller('employee-training')
export class EmployeeTrainingController {
    constructor(
        private readonly employeeTrainingService: EmployeeTrainingService,
    ) { }

    @Post('assign')
    @ApiOperation({ summary: 'Assign training module to employee' })
    async assignTraining(@Body() assignTrainingDto: AssignTrainingDto) {
        return this.employeeTrainingService.assignTraining(assignTrainingDto);
    }

    @Get('employee/:employmentId')
    @ApiOperation({ summary: 'Get all training assignments for an employee' })
    @ApiParam({ name: 'employmentId', description: 'Employment ID' })
    async getEmployeeTrainings(@Param('employmentId') employmentId: string) {
        return this.employeeTrainingService.getEmployeeTrainings(employmentId);
    }

    @Get('employee/:employmentId/todo')
    @ApiOperation({ summary: 'Get pending/in-progress training for an employee' })
    @ApiParam({ name: 'employmentId', description: 'Employment ID' })
    async getTodoTrainings(@Param('employmentId') employmentId: string) {
        return this.employeeTrainingService.getTodoTrainings(employmentId);
    }

    @Put(':id/complete')
    @ApiOperation({ summary: 'Mark training as completed' })
    @ApiParam({ name: 'id', description: 'Training ID' })
    async completeTraining(@Param('id') id: string) {
        return this.employeeTrainingService.completeTraining(id);
    }

    @Get('module/:moduleId')
    @ApiOperation({ summary: 'Get all employees assigned to a module' })
    @ApiParam({ name: 'moduleId', description: 'Module/Course ID' })
    async getModuleAssignments(@Param('moduleId') moduleId: string) {
        return this.employeeTrainingService.getModuleAssignments(moduleId);
    }

    @Put(':id/progress')
    @ApiOperation({ summary: 'Update training progress percentage' })
    @ApiParam({ name: 'id', description: 'Training ID' })
    async updateProgress(
        @Param('id') id: string,
        @Body('progressPercentage') progressPercentage: number,
    ) {
        return this.employeeTrainingService.updateProgress(id, progressPercentage);
    }

    @Put(':id/todo/:todoItemId')
    @ApiOperation({ summary: 'Update todo item completion status' })
    @ApiParam({ name: 'id', description: 'Training ID' })
    @ApiParam({ name: 'todoItemId', description: 'Todo Item ID' })
    async updateTodoItem(
        @Param('id') id: string,
        @Param('todoItemId') todoItemId: string,
        @Body('isCompleted') isCompleted: boolean,
    ) {
        return this.employeeTrainingService.updateTodoItem(id, todoItemId, isCompleted);
    }
}
