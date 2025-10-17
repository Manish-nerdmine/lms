import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkVideoCompleteDto {
  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09e', 
    description: 'Course ID'
  })
  @IsNotEmpty()
  @IsMongoId()
  courseId: string;

  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09f', 
    description: 'Video ID'
  })
  @IsNotEmpty()
  @IsMongoId()
  videoId: string;
}

