import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCourseDto {
  @ApiProperty({ description: 'Course ID to assign to the group' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Due date for the course completion', example: '2024-12-31T23:59:59.000Z' })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Whether to send email notifications to group members', default: true })
  @IsOptional()
  @IsBoolean()
  sendEmailNotifications?: boolean = true;
}
