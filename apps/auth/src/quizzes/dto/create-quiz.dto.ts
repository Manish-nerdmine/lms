import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuestionDto {
  @ApiProperty({ description: 'The question text' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'Array of possible answers', type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ description: 'Index of the correct answer (0-based)' })
  @IsNumber()
  @Min(0)
  correctAnswer: number;

  @ApiProperty({ description: 'Points for this question', default: 1 })
  @IsNumber()
  @Min(1)
  points?: number = 1;
}

export class CreateQuizDto {
  @ApiProperty({ description: 'Title of the quiz' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the quiz', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Array of questions', type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @ApiProperty({ description: 'Minimum score required to pass the quiz', default: 0 })
  @IsNumber()
  @Min(0)
  passingScore?: number = 0;

  @ApiProperty({ description: 'Time limit in minutes', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  timeLimit?: number = 0;
} 