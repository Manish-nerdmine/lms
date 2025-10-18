import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 2847 })
  activeLearners: number;

  @ApiProperty({ example: 12.5 })
  activeLearnersChange: number;

  @ApiProperty({ example: 156 })
  totalCourses: number;

  @ApiProperty({ example: 2.1 })
  totalCoursesChange: number;

  @ApiProperty({ example: 87 })
  avgCompletionRate: number;

  @ApiProperty({ example: 1.2 })
  avgCompletionRateChange: number;

  @ApiProperty({ example: 83 })
  avgLearnerProgress: number;

  @ApiProperty({ example: 7.8 })
  avgLearnerProgressChange: number;
}

export class EnrollmentDataDto {
  @ApiProperty({ example: 'Feb' })
  month: string;

  @ApiProperty({ example: 700 })
  enrollments: number;
}

export class ActiveLearnerDto {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ example: '657e902c4b628d1f0fc8f09d' })
  id: string;

  @ApiProperty({ example: 'Sarah Johnson' })
  name: string;

  @ApiProperty({ example: 'SJ' })
  initials: string;

  @ApiProperty({ example: 12 })
  completedCourses: number;

  @ApiProperty({ example: '12h' })
  timeSpent: string;

  @ApiProperty({ example: 96 })
  weeklyPerformance: number;
}

export class TopCourseDto {
  @ApiProperty({ example: '657e902c4b628d1f0fc8f09e' })
  courseId: string;

  @ApiProperty({ example: 'Cybersecurity Fundamentals' })
  courseName: string;

  @ApiProperty({ example: 1200 })
  enrolled: number;

  @ApiProperty({ example: 92 })
  avgScore: number;

  @ApiProperty({ example: 1320 })
  completed: number;

  @ApiProperty({ example: 94 })
  completionRate: number;
}

export class NewCourseDto {
  @ApiProperty({ example: '657e902c4b628d1f0fc8f09e' })
  courseId: string;

  @ApiProperty({ example: 'Advanced Threat Detection' })
  courseName: string;

  @ApiProperty({ example: '0 day ago' })
  createdAgo: string;

  @ApiProperty()
  createdAt: Date;
}

