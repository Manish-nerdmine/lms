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
  @ApiProperty({ description: 'Employment ID' })
  employmentId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Employee full name' })
  fullName: string;

  @ApiProperty({ description: 'Employee email address' })
  email: string;

  @ApiProperty({ description: 'Employee role' })
  role: string;

  @ApiProperty({ description: 'Is employee account active' })
  isActive: boolean;

  @ApiProperty({ description: 'Employee progress details', type: UserProgressDto })
  progress: UserProgressDto;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}

export class CourseUsersProgressResponseDto {
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  courseTitle: string;

  @ApiProperty({ description: 'Number of videos available in the course' })
  videoCount: number;

  @ApiProperty({ description: 'Total number of employees enrolled in the course' })
  totalUsers: number;

  @ApiProperty({ description: 'Array of employees with their progress', type: [UserWithProgressDto] })
  users: UserWithProgressDto[];
}
