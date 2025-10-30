import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, UserProgress } from '@app/common/models/lms.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { Group } from '@app/common/models/group.schema';
import { EmploymentDocument } from '@app/common/models/employment.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseUsersProgressResponseDto } from './dto/course-users-progress.dto';
import { VideosService } from '../videos/videos.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { ServerUtils } from '../utils/server.utils';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly uploadDir = path.join(process.cwd(), 'apps/auth/src/courses/thumbnails');

  getUploadDir(): string {
    return this.uploadDir;
  }

  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(UserProgress.name) private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(EmploymentDocument.name) private readonly employmentModel: Model<EmploymentDocument>,
    private readonly videosService: VideosService,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(createCourseDto: CreateCourseDto, file?: Express.Multer.File): Promise<Course> {
    let thumbnailUrl = createCourseDto.thumbnail;
    let filename: string | undefined;

    if (file) {
      filename = `${uuidv4()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);

      try {
        fs.writeFileSync(filepath, new Uint8Array(file.buffer));
        this.logger.log(`Thumbnail saved successfully at ${filepath}`);
      } catch (error) {
        this.logger.error(`Failed to save thumbnail: ${error.message}`);
        throw new Error('Failed to save thumbnail');
      }
    }

    // Check if the user is a super admin
    const user = await this.userModel.findById(createCourseDto.userId).exec();
    const isSuperAdminCourse = user?.isSuperAdmin === true;

    // Create the course first to get the ID
    const course = new this.courseModel({ 
      ...createCourseDto, 
      userId: new Types.ObjectId(createCourseDto.userId),
      isSuperAdminCourse
    });
    const savedCourse = await course.save();

    // Now generate the thumbnail URL with the course ID
    if (filename) {
      thumbnailUrl = ServerUtils.getThumbnailUrl(savedCourse._id.toString(), filename);
      
      // Update the course with the proper thumbnail URL and return the updated course
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        savedCourse._id,
        { thumbnail: thumbnailUrl },
        { new: true }
      ).exec();
      
      this.logger.log(`Thumbnail URL generated: ${thumbnailUrl}`);
      return updatedCourse;
    }

    return savedCourse;
  }

  async findAll(userId?: string): Promise<any[]> {
    // Include super admin courses for all users
    const filter = userId ? { $or: [{ userId }, { isSuperAdminCourse: true }] } : {};
    const courses = await this.courseModel.find(filter).populate('videos').populate('quizzes').populate('userId', 'fullName email').exec();
    
    // Add video count and fix thumbnail URLs for each course
    const coursesWithVideoCount = await Promise.all(
      courses.map(async (course) => {
        const videoCount = await this.videosService.getVideoCountByCourseId(course._id.toString());
        
        // Fix thumbnail URL format if needed
        let thumbnailUrl = course.thumbnail;
        if (thumbnailUrl && thumbnailUrl.includes('/thumbnails/') && !thumbnailUrl.includes(`/${course._id}/thumbnails/`)) {
          // This is an old format URL, convert it to new format
          const filename = path.basename(thumbnailUrl);
          thumbnailUrl = ServerUtils.getThumbnailUrl(course._id.toString(), filename);
        }
        
        return {
          ...course.toObject(),
          videoCount,
          thumbnail: thumbnailUrl,
        };
      })
    );
    
    return coursesWithVideoCount;
  }

  async findOne(id: string): Promise<any> {
    const course = await this.courseModel
      .findById(id)
      .populate('videos')
      .populate('quizzes')
      .populate('userId', 'fullName email')
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Add video count to the course
    const videoCount = await this.videosService.getVideoCountByCourseId(id);
    
    // Fix thumbnail URL format if needed
    let thumbnailUrl = course.thumbnail;
    if (thumbnailUrl && thumbnailUrl.includes('/thumbnails/') && !thumbnailUrl.includes(`/${id}/thumbnails/`)) {
      // This is an old format URL, convert it to new format
      const filename = path.basename(thumbnailUrl);
      thumbnailUrl = ServerUtils.getThumbnailUrl(id, filename);
    }
    
    return {
      ...course.toObject(),
      videoCount,
      thumbnail: thumbnailUrl,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, file?: Express.Multer.File): Promise<Course> {
    const course = await this.findOne(id);
    let thumbnailUrl = updateCourseDto.thumbnail;
    let filename: string | undefined;

    if (file) {
      // Delete old thumbnail if exists
      if (course.thumbnail) {
        const oldFilename = path.basename(course.thumbnail);
        const oldFilepath = path.join(this.uploadDir, oldFilename);
        if (fs.existsSync(oldFilepath)) {
          fs.unlinkSync(oldFilepath);
        }
      }

      // Save new thumbnail
      filename = `${uuidv4()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);

      try {
        fs.writeFileSync(filepath, new Uint8Array(file.buffer));
        this.logger.log(`Thumbnail saved successfully at ${filepath}`);
      } catch (error) {
        this.logger.error(`Failed to save thumbnail: ${error.message}`);
        throw new Error('Failed to save thumbnail');
      }
    }

    // Generate thumbnail URL with course ID if a new file was uploaded
    if (filename) {
      thumbnailUrl = ServerUtils.getThumbnailUrl(id, filename);
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(
        id,
        { ...updateCourseDto, thumbnail: thumbnailUrl },
        { new: true }
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('Course not found');
    }

    return updatedCourse;
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    
    // Delete thumbnail if exists
    if (course.thumbnail) {
      const filename = path.basename(course.thumbnail);
      const filepath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    const result = await this.courseModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Course not found');
    }
  }

  async getCourseUsersWithProgress(courseId: string): Promise<CourseUsersProgressResponseDto> {
    // First check if course exists
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Find groups that have this course assigned
    const groupsWithCourse = await this.groupModel.find({
      'courses.courseId': courseId
    }).exec();

    const groupIds = groupsWithCourse.map(group => group._id);

    // Find employees who belong to these groups
    const employeesInGroups = await this.employmentModel.find({
      groupId: { $in: groupIds }
    }).exec();

    // Get all user progress records for this course (both by userId and employmentId)
    const userProgresses = await this.userProgressModel
      .find({ courseId })
      .exec();

    // Create a map of user progress by userId and employmentId
    const progressMapByUserId = new Map();
    const progressMapByEmploymentId = new Map();
    
    userProgresses.forEach(progress => {
      const progressData = {
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        progressPercentage: progress.progressPercentage,
        isCourseCompleted: progress.isCourseCompleted,
        totalCompletedItems: progress.completedVideos.length + progress.completedQuizzes.length,
        lastUpdated: (progress as any).updatedAt,
      };
      
      if (progress.userId) {
        progressMapByUserId.set(progress.userId.toString(), progressData);
      }
      if (progress.employmentId) {
        progressMapByEmploymentId.set(progress.employmentId.toString(), progressData);
      }
    });

    // Transform the data to include employee details and progress
    const employeesWithProgress = employeesInGroups.map(employee => {
      // Try to find progress by employmentId first, then userId
      const progress = progressMapByEmploymentId.get(employee._id.toString()) || 
                       progressMapByUserId.get(employee.userId.toString()) || {
        completedVideos: [],
        completedQuizzes: [],
        progressPercentage: 0,
        isCourseCompleted: false,
        totalCompletedItems: 0,
        lastUpdated: employee.updatedAt,
      };

      return {
        employmentId: employee._id.toString(),
        userId: employee.userId.toString(),
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        isActive: employee.isActive,
        progress: {
          completedVideos: progress.completedVideos,
          completedQuizzes: progress.completedQuizzes,
          progressPercentage: progress.progressPercentage,
          isCourseCompleted: progress.isCourseCompleted,
          totalCompletedItems: progress.totalCompletedItems,
        },
        lastUpdated: progress.lastUpdated,
      };
    });

    const videoCount = await this.videosService.getVideoCountByCourseId(courseId);
    
    return {
      courseId,
      courseTitle: course.title,
      videoCount,
      totalUsers: employeesWithProgress.length,
      users: employeesWithProgress,
    };
  }

  async getUserCompletedCourses(userId: string): Promise<any[]> {
    // Find user's group
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.groupId) {
      return [];
    }

    // Get user's group with assigned courses
    const group = await this.groupModel.findById(user.groupId).exec();
    if (!group || !group.courses || group.courses.length === 0) {
      return [];
    }

    // Get all user progress records for this user
    const userProgresses = await this.userProgressModel
      .find({ userId })
      .populate('courseId', 'title description thumbnail')
      .exec();

    // Create a map of course progress
    const progressMap = new Map();
    userProgresses.forEach(progress => {
      const course = progress.courseId as any;
      progressMap.set(course._id.toString(), {
        progressPercentage: progress.progressPercentage,
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        lastUpdated: (progress as any).updatedAt,
      });
    });

    // Filter completed courses (100% progress)
    const completedCourses = [];
    for (const courseAssignment of group.courses) {
      const course = await this.courseModel.findById(courseAssignment.courseId).exec();
      if (course) {
        const progress = progressMap.get(course._id.toString());
        if (progress && progress.progressPercentage >= 100) {
          const videoCount = await this.videosService.getVideoCountByCourseId(course._id.toString());
          completedCourses.push({
            courseId: course._id.toString(),
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            dueDate: courseAssignment.dueDate,
            progressPercentage: progress.progressPercentage,
            completedVideos: progress.completedVideos,
            completedQuizzes: progress.completedQuizzes,
            videoCount,
            completedAt: progress.lastUpdated,
          });
        }
      }
    }

    return completedCourses;
  }

  async getUserTodoCourses(userId: string): Promise<any[]> {
    // Find user's group
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.groupId) {
      return [];
    }

    // Get user's group with assigned courses
    const group = await this.groupModel.findById(user.groupId).exec();
    if (!group || !group.courses || group.courses.length === 0) {
      return [];
    }

    // Get all user progress records for this user
    const userProgresses = await this.userProgressModel
      .find({ userId })
      .populate('courseId', 'title description thumbnail')
      .exec();

    // Create a map of course progress
    const progressMap = new Map();
    userProgresses.forEach(progress => {
      const course = progress.courseId as any;
      progressMap.set(course._id.toString(), {
        progressPercentage: progress.progressPercentage,
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        lastUpdated: (progress as any).updatedAt,
      });
    });

    // Filter pending courses (not 100% progress and not overdue)
    const todoCourses = [];
    const currentDate = new Date();

    for (const courseAssignment of group.courses) {
      const course = await this.courseModel.findById(courseAssignment.courseId).exec();
      if (course) {
        const progress = progressMap.get(course._id.toString());
        const progressPercentage = progress ? progress.progressPercentage : 0;
        const isNotOverdue = courseAssignment.dueDate > currentDate;

        if (progressPercentage < 100 && isNotOverdue) {
          const videoCount = await this.videosService.getVideoCountByCourseId(course._id.toString());
          todoCourses.push({
            courseId: course._id.toString(),
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            dueDate: courseAssignment.dueDate,
            progressPercentage: progressPercentage,
            completedVideos: progress ? progress.completedVideos : [],
            completedQuizzes: progress ? progress.completedQuizzes : [],
            videoCount,
            daysRemaining: Math.ceil((courseAssignment.dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          });
        }
      }
    }

    return todoCourses;
  }

  async getUserOverdueCourses(userId: string): Promise<any[]> {
    // Find user's group
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.groupId) {
      return [];
    }

    // Get user's group with assigned courses
    const group = await this.groupModel.findById(user.groupId).exec();
    if (!group || !group.courses || group.courses.length === 0) {
      return [];
    }

    // Get all user progress records for this user
    const userProgresses = await this.userProgressModel
      .find({ userId })
      .populate('courseId', 'title description thumbnail')
      .exec();

    // Create a map of course progress
    const progressMap = new Map();
    userProgresses.forEach(progress => {
      const course = progress.courseId as any;
      progressMap.set(course._id.toString(), {
        progressPercentage: progress.progressPercentage,
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        lastUpdated: (progress as any).updatedAt,
      });
    });

    // Filter overdue courses (due date passed and not 100% complete)
    const overdueCourses = [];
    const currentDate = new Date();

    for (const courseAssignment of group.courses) {
      const course = await this.courseModel.findById(courseAssignment.courseId).exec();
      if (course) {
        const progress = progressMap.get(course._id.toString());
        const progressPercentage = progress ? progress.progressPercentage : 0;
        const isOverdue = courseAssignment.dueDate < currentDate;

        if (progressPercentage < 100 && isOverdue) {
          const daysOverdue = Math.ceil((currentDate.getTime() - courseAssignment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const videoCount = await this.videosService.getVideoCountByCourseId(course._id.toString());
          
          overdueCourses.push({
            courseId: course._id.toString(),
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            dueDate: courseAssignment.dueDate,
            progressPercentage: progressPercentage,
            completedVideos: progress ? progress.completedVideos : [],
            completedQuizzes: progress ? progress.completedQuizzes : [],
            videoCount,
            daysOverdue: daysOverdue,
          });
        }
      }
    }

    return overdueCourses;
  }

  async getUserCourseStatus(userId: string): Promise<any> {
    // Find user's group
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.groupId) {
      return {
        completed: [],
        todo: [],
        overdue: [],
        summary: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          completionRate: 0,
        },
      };
    }

    // Get user's group with assigned courses
    const group = await this.groupModel.findById(user.groupId).exec();
    if (!group || !group.courses || group.courses.length === 0) {
      return {
        completed: [],
        todo: [],
        overdue: [],
        summary: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          completionRate: 0,
        },
      };
    }

    // Get all user progress records for this user
    const userProgresses = await this.userProgressModel
      .find({ userId })
      .populate('courseId', 'title description thumbnail')
      .exec();

    // Create a map of course progress
    const progressMap = new Map();
    userProgresses.forEach(progress => {
      const course = progress.courseId as any;
      progressMap.set(course._id.toString(), {
        progressPercentage: progress.progressPercentage,
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        lastUpdated: (progress as any).updatedAt,
      });
    });

    const completedCourses = [];
    const todoCourses = [];
    const overdueCourses = [];
    const currentDate = new Date();

    for (const courseAssignment of group.courses) {
      const course = await this.courseModel.findById(courseAssignment.courseId).exec();
      if (course) {
        const progress = progressMap.get(course._id.toString());
        const progressPercentage = progress ? progress.progressPercentage : 0;
        const isOverdue = courseAssignment.dueDate < currentDate;
        const isCompleted = progressPercentage >= 100;

        const videoCount = await this.videosService.getVideoCountByCourseId(course._id.toString());
        
        const courseData = {
          courseId: course._id.toString(),
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          dueDate: courseAssignment.dueDate,
          progressPercentage: progressPercentage,
          completedVideos: progress ? progress.completedVideos : [],
          completedQuizzes: progress ? progress.completedQuizzes : [],
          videoCount,
        };

        if (isCompleted) {
          completedCourses.push({
            ...courseData,
            completedAt: progress.lastUpdated,
          });
        } else if (isOverdue) {
          const daysOverdue = Math.ceil((currentDate.getTime() - courseAssignment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          overdueCourses.push({
            ...courseData,
            daysOverdue: daysOverdue,
          });
        } else {
          const daysRemaining = Math.ceil((courseAssignment.dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          todoCourses.push({
            ...courseData,
            daysRemaining: daysRemaining,
          });
        }
      }
    }

    const total = group.courses.length;
    const completed = completedCourses.length;
    const pending = todoCourses.length;
    const overdue = overdueCourses.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      completed: completedCourses,
      todo: todoCourses,
      overdue: overdueCourses,
      summary: {
        total,
        completed,
        pending,
        overdue,
        completionRate: Math.round(completionRate * 100) / 100,
      },
    };
  }

  async getCertificate(userId: string, courseId: string): Promise<any> {
    // Fetch user details
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch course details
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Fetch user progress for this course
    const userProgress = await this.userProgressModel
      .findOne({ userId, courseId })
      .exec();

    if (!userProgress) {
      throw new NotFoundException('No progress found for this course');
    }

    // Check if course is completed (100% progress)
    if (userProgress.progressPercentage < 100) {
      throw new NotFoundException(
        `Course not completed. Current progress: ${userProgress.progressPercentage}%`
      );
    }

    // Generate a certificate ID (you can use a more sophisticated method)
    const certificateId = `CERT-${userId.substring(0, 8).toUpperCase()}-${courseId.substring(0, 8).toUpperCase()}-${Date.now()}`;

    return {
      userId: user._id.toString(),
      userName: user.fullName,
      userEmail: user.email,
      courseId: course._id.toString(),
      courseName: course.title,
      courseDescription: course.description,
      completedAt: (userProgress as any).updatedAt,
      progressPercentage: userProgress.progressPercentage,
      completedVideos: userProgress.completedVideos.length,
      completedQuizzes: userProgress.completedQuizzes.length,
      certificateId: certificateId,
      issuedDate: new Date(),
    };
  }

  async getUnassignedCourses(userId: string): Promise<any> {
    const group = await this.groupModel.find({userId: new Types.ObjectId(userId) }).exec();
    // Find user by userId
    let groupName = []

    if(group.length >0) {
      group.map(g => {
        if(g.courses.length ===  0) {
          groupName.push({
            groupName: g.name,
            _id: g._id,
          });
        }
      });
    }
    return {
      groupName,
    };
  }

  async getEmploymentCourseStatus(employmentId: string): Promise<any> {
    // Find employment record
    const employment = await this.employmentModel.findById(employmentId).exec();
    if (!employment) {
      throw new NotFoundException('Employment record not found');
    }

    const userId = employment.userId.toString();

    // Check if employment has a group assigned
    if (!employment.groupId) {
      return {
        employmentId: employment._id.toString(),
        userId: userId,
        employeeName: employment.fullName,
        employeeEmail: employment.email,
        completed: [],
        todo: [],
        overdue: [],
        summary: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          completionRate: 0,
        },
      };
    }

    // Get employment's group with assigned courses
    const group = await this.groupModel.findById(employment.groupId).exec();
    if (!group || !group.courses || group.courses.length === 0) {
      return {
        employmentId: employment._id.toString(),
        userId: userId,
        employeeName: employment.fullName,
        employeeEmail: employment.email,
        completed: [],
        todo: [],
        overdue: [],
        summary: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          completionRate: 0,
        },
      };
    }

    // Get all user progress records for this user
    const userProgresses = await this.userProgressModel
      .find({ userId })
      .populate('courseId', 'title description thumbnail')
      .exec();

    // Create a map of course progress
    const progressMap = new Map();
    userProgresses.forEach(progress => {
      const course = progress.courseId as any;
      progressMap.set(course._id.toString(), {
        progressPercentage: progress.progressPercentage,
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        lastUpdated: (progress as any).updatedAt,
      });
    });

    const completedCourses = [];
    const todoCourses = [];
    const overdueCourses = [];
    const currentDate = new Date();

    for (const courseAssignment of group.courses) {
      const course = await this.courseModel.findById(courseAssignment.courseId).exec();
      if (course) {
        const progress = progressMap.get(course._id.toString());
        const progressPercentage = progress ? progress.progressPercentage : 0;
        const isOverdue = courseAssignment.dueDate < currentDate;
        const isCompleted = progressPercentage >= 100;

        const videoCount = await this.videosService.getVideoCountByCourseId(course._id.toString());
        
        const courseData = {
          courseId: course._id.toString(),
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          dueDate: courseAssignment.dueDate,
          progressPercentage: progressPercentage,
          completedVideos: progress ? progress.completedVideos : [],
          completedQuizzes: progress ? progress.completedQuizzes : [],
          videoCount,
        };

        if (isCompleted) {
          completedCourses.push({
            ...courseData,
            completedAt: progress.lastUpdated,
          });
        } else if (isOverdue) {
          const daysOverdue = Math.ceil((currentDate.getTime() - courseAssignment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          overdueCourses.push({
            ...courseData,
            daysOverdue: daysOverdue,
          });
        } else {
          const daysRemaining = Math.ceil((courseAssignment.dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          todoCourses.push({
            ...courseData,
            daysRemaining: daysRemaining,
          });
        }
      }
    }

    const total = group.courses.length;
    const completed = completedCourses.length;
    const pending = todoCourses.length;
    const overdue = overdueCourses.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      employmentId: employment._id.toString(),
      userId: userId,
      employeeName: employment.fullName,
      employeeEmail: employment.email,
      completed: completedCourses,
      todo: todoCourses,
      overdue: overdueCourses,
      summary: {
        total,
        completed,
        pending,
        overdue,
        completionRate: Math.round(completionRate * 100) / 100,
      },
    };
  }
} 