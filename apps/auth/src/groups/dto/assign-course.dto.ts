import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCourseDto {
  @ApiProperty({ description: 'Course ID to assign to the group' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Whether to send email notifications to group members', default: true })
  @IsOptional()
  @IsBoolean()
  sendEmailNotifications?: boolean = true;
}
