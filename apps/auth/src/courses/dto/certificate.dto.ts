import { ApiProperty } from '@nestjs/swagger';

export class CertificateResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User full name' })
  userName: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Course name/title' })
  courseName: string;

  @ApiProperty({ description: 'Course description' })
  courseDescription: string;

  @ApiProperty({ description: 'Date when course was completed' })
  completedAt: Date;

  @ApiProperty({ description: 'Progress percentage (should be 100 for certificate)' })
  progressPercentage: number;

  @ApiProperty({ description: 'Number of completed videos' })
  completedVideos: number;

  @ApiProperty({ description: 'Number of completed quizzes' })
  completedQuizzes: number;

  @ApiProperty({ description: 'Unique certificate ID' })
  certificateId: string;

  @ApiProperty({ description: 'Certificate issue date' })
  issuedDate: Date;
}

