import { ApiProperty } from '@nestjs/swagger';

export class UserProgressDto {
  @ApiProperty({ description: 'Array of completed video IDs' })
  completedVideos: string[];

  @ApiProperty({ description: 'Array of completed quiz IDs' })
  completedQuizzes: string[];

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progressPercentage: number;

  @ApiProperty({ description: 'Total number of completed items' })
  totalCompletedItems: number;
}

export class UserWithProgressDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'User type' })
  userType: string;

  @ApiProperty({ description: 'User progress details', type: UserProgressDto })
  progress: UserProgressDto;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}

export class CourseUsersProgressResponseDto {
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  courseTitle: string;

  @ApiProperty({ description: 'Total number of users enrolled in the course' })
  totalUsers: number;

  @ApiProperty({ description: 'Array of users with their progress', type: [UserWithProgressDto] })
  users: UserWithProgressDto[];
}
