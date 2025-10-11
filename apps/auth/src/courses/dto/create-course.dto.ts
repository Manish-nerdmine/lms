import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the course', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'User ID', required: true })
  @IsOptional()
  @IsString()
  userId?: Types.ObjectId;

  @ApiProperty({ description: 'Thumbnail image file or URL', required: false, type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
} 