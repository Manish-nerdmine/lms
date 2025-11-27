import { IsNotEmpty, IsOptional, IsString, IsArray, IsDate, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TodoItemDto {
    @ApiProperty({ description: 'Unique identifier for the todo item', required: false })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ description: 'Title of the todo item' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Description of the todo item', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export class AssignTrainingDto {
    @ApiProperty({ description: 'Employment ID of the employee' })
    @IsNotEmpty()
    @IsString()
    employmentId: string;

    @ApiProperty({ description: 'Module/Course ID to assign' })
    @IsNotEmpty()
    @IsString()
    moduleId: string;

    @ApiProperty({ description: 'User ID who is assigning the training', required: false })
    @IsOptional()
    @IsString()
    assignedBy?: string;

    @ApiProperty({ description: 'Due date for training completion', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dueDate?: Date;

    @ApiProperty({ description: 'Todo items for the training', required: false, type: [TodoItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TodoItemDto)
    todoList?: TodoItemDto[];
}
