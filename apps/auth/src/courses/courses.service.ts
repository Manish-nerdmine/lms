import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, UserProgress } from '@app/common/models/lms.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { Group } from '@app/common/models/group.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseUsersProgressResponseDto } from './dto/course-users-progress.dto';
import { VideosService } from '../videos/videos.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
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

    // Create the course first to get the ID
    const course = new this.courseModel(createCourseDto);
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

  async findAll(): Promise<any[]> {
    const courses = await this.courseModel.find().populate('videos').populate('quizzes').exec();
    
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

  async update(id: string, updateCourseDto: Partial<CreateCourseDto>, file?: Express.Multer.File): Promise<Course> {
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

    const groupIds = groupsWithCourse.map(group => group._id.toString());

    // Find users who belong to these groups
    const usersInGroups = await this.userModel.find({
      groupId: { $in: groupIds }
    }).exec();

    // Get all user progress records for this course
    const userProgresses = await this.userProgressModel
      .find({ courseId })
      .populate('userId', 'fullName email companyName userType')
      .exec();

    // Create a map of user progress by userId
    const progressMap = new Map();
    userProgresses.forEach(progress => {
      const user = progress.userId as any;
      progressMap.set(user._id.toString(), {
        completedVideos: progress.completedVideos,
        completedQuizzes: progress.completedQuizzes,
        progressPercentage: progress.progressPercentage,
        totalCompletedItems: progress.completedVideos.length + progress.completedQuizzes.length,
        lastUpdated: (progress as any).updatedAt,
      });
    });

    // Transform the data to include user details and progress
    const usersWithProgress = usersInGroups.map(user => {
      const progress = progressMap.get(user._id.toString()) || {
        completedVideos: [],
        completedQuizzes: [],
        progressPercentage: 0,
        totalCompletedItems: 0,
        lastUpdated: user.updatedAt,
      };

      return {
        userId: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        userType: user.userType,
        progress: {
          completedVideos: progress.completedVideos,
          completedQuizzes: progress.completedQuizzes,
          progressPercentage: progress.progressPercentage,
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
      totalUsers: usersWithProgress.length,
      users: usersWithProgress,
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
} 