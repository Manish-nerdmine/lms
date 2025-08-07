import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Name of the group' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the group', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Course ID to assign to the group' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Array of user IDs to assign to the group', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiProperty({ description: 'Whether the group is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Department ID', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: 'Maximum number of participants', default: 0 })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number = 0;

  @ApiProperty({ description: 'Current number of participants', default: 0 })
  @IsOptional()
  @IsNumber()
  currentParticipants?: number = 0;

  @ApiProperty({ description: 'Start date of the group', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date of the group', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Status of the group', default: 'pending' })
  @IsOptional()
  @IsString()
  status?: string = 'pending';
} 