import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, UserProgress, QuizAttempt } from '@app/common/models/lms.schema';
import { EmploymentDocument } from '@app/common/models/employment.schema';
import { UserDocument } from '@app/common/models/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(UserProgress.name) private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(QuizAttempt.name) private readonly quizAttemptModel: Model<QuizAttempt>,
    @InjectModel(EmploymentDocument.name) private readonly employmentModel: Model<EmploymentDocument>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId?: string) {
    const matchQuery = userId ? { userId: new Types.ObjectId(userId) } : {};

    // Get current month and previous month dates
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Active Learners (employees with isActive: true)
    const currentActiveEmployees = await this.employmentModel.countDocuments({
      ...matchQuery,
      isActive: true,
      lastLoggedIn: { $gte: firstDayCurrentMonth }
    });

    const lastMonthActiveEmployees = await this.employmentModel.countDocuments({
      ...matchQuery,
      isActive: true,
      lastLoggedIn: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth }
    });

    const activeLearnersChange = lastMonthActiveEmployees > 0
      ? ((currentActiveEmployees - lastMonthActiveEmployees) / lastMonthActiveEmployees) * 100
      : 0;

    // Total Courses
    const currentCourses = await this.courseModel.countDocuments({
      ...matchQuery,
      isActive: true
    });

    const lastMonthCourses = await this.courseModel.countDocuments({
      ...matchQuery,
      isActive: true,
      createdAt: { $lt: firstDayCurrentMonth }
    });

    const totalCoursesChange = lastMonthCourses > 0
      ? ((currentCourses - lastMonthCourses) / lastMonthCourses) * 100
      : 0;

    // Average Completion Rate
    const completionStats = await this.userProgressModel.aggregate([
      ...(userId ? [{ $match: { userId: new Types.ObjectId(userId) } }] : []),
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$progressPercentage' },
          totalCompleted: { $sum: { $cond: ['$isCourseCompleted', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    const avgCompletionRate = completionStats.length > 0
      ? Math.round(completionStats[0].avgCompletion)
      : 0;

    // Get last month's completion rate for comparison
    const lastMonthCompletion = await this.userProgressModel.aggregate([
      {
        $match: {
          ...(userId ? { userId: new Types.ObjectId(userId) } : {}),
          updatedAt: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth }
        }
      },
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$progressPercentage' }
        }
      }
    ]);

    const lastMonthAvgCompletion = lastMonthCompletion.length > 0
      ? Math.round(lastMonthCompletion[0].avgCompletion)
      : avgCompletionRate;

    const avgCompletionRateChange = lastMonthAvgCompletion > 0
      ? ((avgCompletionRate - lastMonthAvgCompletion) / lastMonthAvgCompletion) * 100
      : 0;

    // Average Learner Progress
    const avgLearnerProgress = avgCompletionRate; // Same as completion rate

    const avgLearnerProgressChange = avgCompletionRateChange;

    return {
      activeLearners: currentActiveEmployees,
      activeLearnersChange: parseFloat(activeLearnersChange.toFixed(1)),
      totalCourses: currentCourses,
      totalCoursesChange: parseFloat(totalCoursesChange.toFixed(1)),
      avgCompletionRate,
      avgCompletionRateChange: parseFloat(avgCompletionRateChange.toFixed(1)),
      avgLearnerProgress,
      avgLearnerProgressChange: parseFloat(avgLearnerProgressChange.toFixed(1)),
    };
  }

  /**
   * Get recent enrollments by month
   */
  async getRecentEnrollments(userId?: string, months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const matchQuery: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      matchQuery.userId = new Types.ObjectId(userId);
    }

    const enrollments = await this.employmentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format data with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return enrollments.map(item => ({
      month: monthNames[item._id.month - 1],
      enrollments: item.count
    }));
  }

  /**
   * Get most active learners (employees)
   */
  async getMostActiveLearners(userId?: string, limit: number = 5) {
    const matchQuery: any = { isActive: true };
    if (userId) {
      matchQuery.userId = new Types.ObjectId(userId);
    }

    // Get employees with their progress data
    const activeLearners = await this.employmentModel.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'userprogresses',
          localField: '_id',
          foreignField: 'employmentId',
          as: 'progress'
        }
      },
      {
        $addFields: {
          completedCourses: {
            $size: {
              $filter: {
                input: '$progress',
                as: 'p',
                cond: { $eq: ['$$p.isCourseCompleted', true] }
              }
            }
          },
          avgProgress: { $avg: '$progress.progressPercentage' },
          totalProgress: { $size: '$progress' }
        }
      },
      {
        $match: {
          totalProgress: { $gt: 0 }
        }
      },
      { $sort: { avgProgress: -1, completedCourses: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          completedCourses: 1,
          avgProgress: 1,
          lastLoggedIn: 1
        }
      }
    ]);

    // Generate initials and format data
    return activeLearners.map((learner, index) => {
      const names = learner.fullName.split(' ');
      const initials = names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : learner.fullName.substring(0, 2).toUpperCase();

      // Calculate estimated time spent (rough estimate: 1 course = 1 hour)
      const timeSpent = `${learner.completedCourses}h`;

      return {
        rank: index + 1,
        id: learner._id.toString(),
        name: learner.fullName,
        initials,
        completedCourses: learner.completedCourses,
        timeSpent,
        weeklyPerformance: Math.round(learner.avgProgress)
      };
    });
  }

  /**
   * Get top performing courses
   */
  async getTopPerformingCourses(userId?: string, limit: number = 10) {
    const matchQuery: any = { isActive: true };
    if (userId) {
      matchQuery.userId = new Types.ObjectId(userId);
    }

    const topCourses = await this.courseModel.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'userprogresses',
          localField: '_id',
          foreignField: 'courseId',
          as: 'progress'
        }
      },
      {
        $lookup: {
          from: 'quizattempts',
          localField: 'quizzes',
          foreignField: 'quizId',
          as: 'quizAttempts'
        }
      },
      {
        $addFields: {
          enrolled: { $size: '$progress' },
          completed: {
            $size: {
              $filter: {
                input: '$progress',
                as: 'p',
                cond: { $eq: ['$$p.isCourseCompleted', true] }
              }
            }
          },
          avgScore: {
            $cond: {
              if: { $gt: [{ $size: '$quizAttempts' }, 0] },
              then: { $avg: '$quizAttempts.percentage' },
              else: 0
            }
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $cond: {
              if: { $gt: ['$enrolled', 0] },
              then: { $multiply: [{ $divide: ['$completed', '$enrolled'] }, 100] },
              else: 0
            }
          }
        }
      },
      {
        $match: {
          enrolled: { $gt: 0 }
        }
      },
      { $sort: { completionRate: -1, enrolled: -1 } },
      { $limit: limit },
      {
        $project: {
          courseId: '$_id',
          courseName: '$title',
          enrolled: 1,
          avgScore: { $round: ['$avgScore', 0] },
          completed: 1,
          completionRate: { $round: ['$completionRate', 0] }
        }
      }
    ]);

    return topCourses;
  }

  /**
   * Get new courses
   */
  async getNewCourses(userId?: string, limit: number = 10) {
    const matchQuery: any = { isActive: true };
    if (userId) {
      matchQuery.userId = new Types.ObjectId(userId);
    }

    const newCourses = await this.courseModel
      .find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id title createdAt')
      .exec();

    const now = new Date();

    return newCourses.map(course => {
      const diffTime = Math.abs(now.getTime() - course.createdAt.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let createdAgo: string;
      if (diffDays === 0) {
        createdAgo = 'Today';
      } else if (diffDays === 1) {
        createdAgo = '1 day ago';
      } else if (diffDays < 30) {
        createdAgo = `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        createdAgo = months === 1 ? '1 month ago' : `${months} months ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        createdAgo = years === 1 ? '1 year ago' : `${years} years ago`;
      }

      return {
        courseId: course._id.toString(),
        courseName: course.title,
        createdAgo,
        createdAt: course.createdAt
      };
    });
  }

  /**
   * Get complete dashboard data
   */
  async getCompleteDashboard(userId?: string) {
    const [stats, enrollments, activeLearners, topCourses, newCourses] = await Promise.all([
      this.getDashboardStats(userId),
      this.getRecentEnrollments(userId),
      this.getMostActiveLearners(userId),
      this.getTopPerformingCourses(userId),
      this.getNewCourses(userId)
    ]);

    return {
      stats,
      recentEnrollments: enrollments,
      mostActiveLearners: activeLearners,
      topPerformingCourses: topCourses,
      newCourses
    };
  }
}

