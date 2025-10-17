import { IsArray, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09e', 
    description: 'Course ID'
  })
  @IsNotEmpty()
  @IsMongoId()
  courseId: string;

  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09f', 
    description: 'Quiz ID'
  })
  @IsNotEmpty()
  @IsMongoId()
  quizId: string;

  @ApiProperty({ 
    example: [0, 1, 2, 0, 1, 2, 3, 1, 0, 2], 
    description: 'Array of answer indices (0-based) for each question'
  })
  @IsNotEmpty()
  @IsArray()
  answers: number[];
}

