import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the course', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Thumbnail image file or URL', required: false, type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
} 