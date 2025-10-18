import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (Active Learners, Courses, Completion Rate, Progress)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        activeLearners: { type: 'number', example: 2847 },
        activeLearnersChange: { type: 'number', example: 12.5 },
        totalCourses: { type: 'number', example: 156 },
        totalCoursesChange: { type: 'number', example: 2.1 },
        avgCompletionRate: { type: 'number', example: 87 },
        avgCompletionRateChange: { type: 'number', example: 1.2 },
        avgLearnerProgress: { type: 'number', example: 83 },
        avgLearnerProgressChange: { type: 'number', example: 7.8 }
      }
    }
  })
  async getDashboardStats(@Query('userId') userId?: string) {
    return await this.dashboardService.getDashboardStats(userId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get recent enrollments by month (for chart)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'months', required: false, description: 'Number of months (default: 6)' })
  @ApiResponse({
    status: 200,
    description: 'Recent enrollments data',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          month: { type: 'string', example: 'Feb' },
          enrollments: { type: 'number', example: 700 }
        }
      }
    }
  })
  async getRecentEnrollments(
    @Query('userId') userId?: string,
    @Query('months') months?: number
  ) {
    return await this.dashboardService.getRecentEnrollments(userId, months || 6);
  }

  @Get('active-learners')
  @ApiOperation({ summary: 'Get most active learners/employees' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of learners (default: 5)' })
  @ApiResponse({
    status: 200,
    description: 'Most active learners',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number', example: 1 },
          id: { type: 'string', example: '657e902c4b628d1f0fc8f09d' },
          name: { type: 'string', example: 'Sarah Johnson' },
          initials: { type: 'string', example: 'SJ' },
          completedCourses: { type: 'number', example: 12 },
          timeSpent: { type: 'string', example: '12h' },
          weeklyPerformance: { type: 'number', example: 96 }
        }
      }
    }
  })
  async getMostActiveLearners(
    @Query('userId') userId?: string,
    @Query('limit') limit?: number
  ) {
    return await this.dashboardService.getMostActiveLearners(userId, limit || 5);
  }

  @Get('top-courses')
  @ApiOperation({ summary: 'Get top performing courses' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of courses (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Top performing courses',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          courseId: { type: 'string', example: '657e902c4b628d1f0fc8f09e' },
          courseName: { type: 'string', example: 'Cybersecurity Fundamentals' },
          enrolled: { type: 'number', example: 1200 },
          avgScore: { type: 'number', example: 92 },
          completed: { type: 'number', example: 1320 },
          completionRate: { type: 'number', example: 94 }
        }
      }
    }
  })
  async getTopPerformingCourses(
    @Query('userId') userId?: string,
    @Query('limit') limit?: number
  ) {
    return await this.dashboardService.getTopPerformingCourses(userId, limit || 10);
  }

  @Get('new-courses')
  @ApiOperation({ summary: 'Get recently created courses' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of courses (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'New courses',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          courseId: { type: 'string', example: '657e902c4b628d1f0fc8f09e' },
          courseName: { type: 'string', example: 'Advanced Threat Detection' },
          createdAgo: { type: 'string', example: '0 day ago' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getNewCourses(
    @Query('userId') userId?: string,
    @Query('limit') limit?: number
  ) {
    return await this.dashboardService.getNewCourses(userId, limit || 10);
  }

  @Get('complete')
  @ApiOperation({ summary: 'Get complete dashboard data (all metrics in one call)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Complete dashboard data',
    schema: {
      type: 'object',
      properties: {
        stats: { type: 'object' },
        recentEnrollments: { type: 'array' },
        mostActiveLearners: { type: 'array' },
        topPerformingCourses: { type: 'array' },
        newCourses: { type: 'array' }
      }
    }
  })
  async getCompleteDashboard(@Query('userId') userId?: string) {
    return await this.dashboardService.getCompleteDashboard(userId);
  }
}

