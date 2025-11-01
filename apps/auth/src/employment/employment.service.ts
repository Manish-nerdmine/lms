import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { UpdateEmploymentDto } from './dto/update-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { EmploymentRepository } from './employment.repository';
import { PasscodeService } from '../passcode/passcode.service';
import { EmailService } from '../email/email.service';
import { getHashKeys, comparePassword, hashPassword } from '../utils/common.utils';
import { ServerUtils } from '../utils/server.utils';
import { Group } from '@app/common/models/group.schema';
import { Department } from '@app/common/models/department.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { Video, Quiz, UserProgress, QuizAttempt, Course } from '@app/common/models/lms.schema';
import * as XLSX from 'xlsx';

@Injectable()
export class EmploymentService {
  constructor(
    private readonly employmentRepository: EmploymentRepository,
    private readonly passcodeService: PasscodeService,
    private readonly emailService: EmailService,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Department.name) private readonly departmentModel: Model<Department>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(UserProgress.name) private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(QuizAttempt.name) private readonly quizAttemptModel: Model<QuizAttempt>
  ) {}

  async create(createEmploymentDto: CreateEmploymentDto) {
    try {
      // Find user by userId or email
      let user;


      // Check if employment record already exists (created by admin when user was added)
      const existingEmployment = await this.employmentRepository.findOneByEmail(createEmploymentDto.email);
      
      if (existingEmployment) {
        // Employment record exists, update it with signup details
        // Set isActive to true and add password
        const hashedPassword = createEmploymentDto.password 
          ? await hashPassword(createEmploymentDto.password) 
          : existingEmployment.password;

        const updatedEmployment = await this.employmentRepository.update(
          existingEmployment._id.toString(),
          {
            password: hashedPassword,
            isActive: true, // Activate the account when user signs up
            userId: createEmploymentDto.userId,
          }
        );

        return {
          message: 'Employment account activated successfully',
          employment: updatedEmployment
        };
      }


      // Set isActive to true for new employment records
      const employmentData = {
        ...createEmploymentDto,
        userId: createEmploymentDto.userId,
        isActive: false,
      };

      return await this.employmentRepository.createEmployment(employmentData, createEmploymentDto.userId);
    } catch (err) {
      console.log('err', err);
    }
  }

  private async validateCreateEmploymentDto(createEmploymentDto: CreateEmploymentDto) {
    try {
      await this.employmentRepository.findOneByEmail(createEmploymentDto.email);
      throw new ConflictException('Employment record with this email already exists.');
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      // If email doesn't exist in employment, that's good - we can proceed
      return;
    }
  }


  


  async AddEmployment(createEmploymentDto: CreateEmploymentDto) {
    return await this.employmentRepository.createEmployment(createEmploymentDto, createEmploymentDto.userId);
  }

  async login(loginEmploymentDto: LoginEmploymentDto) {
  try {
    const employment = await this.employmentRepository.findOneByEmail(loginEmploymentDto.email);
    if (!employment) {
      throw new UnprocessableEntityException('Invalid Email.');
    }

    if (!employment.isActive) {
      throw new UnprocessableEntityException('Employment account is not active.');
    }

    // Check if employment has a password set
    if (!employment.password) {
      throw new UnprocessableEntityException(
        'No password set for this employment account. Please sign up first.'
      );
    }

    // Verify password using hash comparison
    const passwordIsValid = await comparePassword(loginEmploymentDto.password, employment.password);
    if (!passwordIsValid) {
      throw new UnprocessableEntityException('Invalid Password.');
    }


    // Find group (if exists)
    const group = employment.groupId
      ? await this.groupModel.findOne({ _id: employment.groupId }).exec()
      : null;

    // Create passcode
    const passcode = await getHashKeys();
    const passcodePayload = {
      user: employment._id,
      passcode,
    };
    const passcodeInfo = await this.passcodeService.create(passcodePayload);

    // Final response 
    return {
      message: 'Login successful',
      employmentId: employment._id,
      userId: employment.userId,            
      token: passcodeInfo.passcode,
      role: employment.role,
      groupId: group?._id ?? null,
    };
  } catch (error) {
    if (error instanceof UnprocessableEntityException) {
      throw error;
    }
    throw new UnprocessableEntityException('Login failed. Please try again.');
  }
}

  async getEmploymentById(id: string) {
    try {
      const employment = await this.employmentRepository.findById(id);
      if (!employment) {
        throw new NotFoundException('Employment record not found');
      }
      return employment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  async getAllEmployments(userId?: string, groupId?: string, page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;
      const matchQuery: any = {};

      // Filter by userId if provided
      if (userId) {
        matchQuery.userId = new Types.ObjectId(userId);
      }

      // Filter by groupId if provided
      if (groupId) {
        matchQuery.groupId = new Types.ObjectId(groupId);
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'userdocuments',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'groups',
            localField: 'groupId',
            foreignField: '_id',
            as: 'groupDetails'
          }
        },
        {
          $unwind: {
            path: '$groupDetails',
            preserveNullAndEmptyArrays: true
          }
        }
      ];

      // Add search filter if provided
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { fullName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { 'userDetails.fullName': { $regex: search, $options: 'i' } },
              { 'userDetails.email': { $regex: search, $options: 'i' } }
            ]
          }
        });
      }
      pipeline.push({ $sort: { createdAt: -1 } }); // Latest first

      // Add projection
      pipeline.push({
        $project: {
          fullName: 1,
          email: 1,
          role: 1,
          isActive: 1,
          groupId: 1,
          userId: 1,
          lastLoggedIn: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            fullName: '$userDetails.fullName',
            email: '$userDetails.email',
            companyName: '$userDetails.companyName',
            phone: '$userDetails.phone'
          },
          groupName: '$groupDetails.name'
        }
      });

      // Get total count before pagination
      pipeline.push({ $sort: { createdAt: -1 } }); // Latest first
      const countPipeline = [...pipeline, { $count: 'total' }];
      
      // Add pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
     

      // Execute queries
      const [employments, countResult] = await Promise.all([
        this.employmentRepository.aggregate(pipeline),
        this.employmentRepository.aggregate(countPipeline)
      ]);

      const total = countResult.length > 0 ? countResult[0].total : 0;

      return {
        employments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  async uploadEmploymentsFromExcel(file: Express.Multer.File, userId: string, groupId?: string) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!userId) {
        throw new BadRequestException('userId is required');
      }

      // Validate user exists
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new BadRequestException(`User not found with ID: ${userId}`);
      }

      // Validate group exists if provided
      if (groupId) {
        const group = await this.groupModel.findById(groupId).exec();
        if (!group) {
          throw new BadRequestException(`Group not found with ID: ${groupId}`);
        }
      }

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      const results = {
        success: [],
        failed: [],
      };

      for (const row of data) {
        try {
          // Validate required fields
          if (!row['fullName'] || !row['email'] || !row['role']) {
            throw new BadRequestException('File format is not valid');
          }

          // Check if employment already exists
          const existingEmployment = await this.employmentRepository.findOneByEmail(row['email']);

          const employmentData: any = {
            fullName: row['fullName'],
            email: row['email'],
            role: row['role'],
            isActive: false,
            groupId: groupId,
            userId: new Types.ObjectId(userId)
          };

          if (existingEmployment) {
            // Update existing employment
            await this.employmentRepository.update(
              existingEmployment._id.toString(),
              { ...employmentData, userId: new Types.ObjectId(userId) }
            );
            results.success.push({
              email: row['email'],
              action: 'updated',
            });
          } else {
            // Create new employment
            await this.employmentRepository.createEmployment(employmentData, new Types.ObjectId(userId));
            results.success.push({
              email: row['email'],
              action: 'created',
            });
          }
        } catch (error) {
          results.failed.push({
            row,
            reason: error.message,
          });
        }
      }

      return {
        message: 'Excel upload completed',
        summary: {
          total: data.length,
          successful: results.success.length,
          failed: results.failed.length,
        },
        results,
      };
    } catch (error) {
      console.log('error', error);
      return {
        message: 'File format is not valid',
        error: error.message,
      }
    }
  }

  async getEmploymentWithUserInfo(email: string) {
    try {
      const result = await this.employmentRepository.findEmploymentWithUser(email);
      if (!result || result.length === 0) {
        throw new NotFoundException('Employment record not found');
      }
      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  async getEmploymentsByGroup(groupId: string) {
    try {
      const group = await this.groupModel.findOne({ _id: groupId }).populate({
        path: 'courses.courseId',
        populate: [
          {
            path: 'videos',
            model: 'Video'
          },
          {
            path: 'quizzes',
            model: 'Quiz'
          }
        ]
      }).exec();
      console.log(group);

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      // Transform the data to include full course details
      const coursesWithDetails = group.courses.map(course => {
        const courseData = course.courseId as any; // Type assertion for populated data
        return {
          courseId: courseData._id,
          dueDate: course.dueDate,
          courseDetails: {
            title: courseData.title,
            description: courseData.description,
            thumbnail: courseData.thumbnail,
            isActive: courseData.isActive,
            videos: courseData.videos || [],
            quizzes: courseData.quizzes || [],
            totalVideos: courseData.videos ? courseData.videos.length : 0,
            totalQuizzes: courseData.quizzes ? courseData.quizzes.length : 0,
            createdAt: courseData.createdAt,
            updatedAt: courseData.updatedAt
          }
        };
      });

      return {
        groupId: group._id,
        groupName: group.name,
        groupDescription: group.description,
        totalCourses: coursesWithDetails.length,
        courses: coursesWithDetails
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Update employment record
   * @param id - Employment ID
   * @param updateData - Data to update
   * @returns Updated employment record
   */
  async updateEmployment(id: string, updateEmploymentDto: UpdateEmploymentDto) {
    try {
      // Check if employment exists
      const existingEmployment = await this.employmentRepository.findById(id);
      if (!existingEmployment) {
        throw new NotFoundException('Employment record not found');
      }

      // If email is being updated, check if it's already in use
      if (updateEmploymentDto.email && updateEmploymentDto.email !== existingEmployment.email) {
        const emailExists = await this.employmentRepository.findOneByEmail(updateEmploymentDto.email);
        if (emailExists) {
          throw new ConflictException('Email is already in use by another employment record');
        }
      }

      // If groupId is being updated, validate it exists
      if (updateEmploymentDto.groupId) {
        const group = await this.groupModel.findById(updateEmploymentDto.groupId).exec();
        if (!group) {
          throw new NotFoundException('Group not found');
        }
      }

      const updatedEmployment = await this.employmentRepository.update(id, updateEmploymentDto);
      
      if (!updatedEmployment) {
        throw new NotFoundException('Failed to update employment record');
      }

      return {
        message: 'Employment updated successfully',
        employment: updatedEmployment
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Delete employment record
   * @param id - Employment ID
   * @returns Success message
   */
  async deleteEmployment(id: string) {
    try {
      // Check if employment exists
      const existingEmployment = await this.employmentRepository.findById(id);
      if (!existingEmployment) {
        throw new NotFoundException('Employment record not found');
      }

      // Check if employment belongs to a group with assigned courses
      if (existingEmployment.groupId) {
        const group = await this.groupModel.findById(existingEmployment.groupId).exec();
        if (group && group.courses && group.courses.length > 0) {
          throw new ForbiddenException(
            'Cannot delete employee from group with assigned courses. Please remove course assignments first.'
          );
        }
      }

      const deleted = await this.employmentRepository.delete(id);
      if (!deleted) {
        throw new NotFoundException('Employment record not found');
      }
      
      return {
        message: 'Employment deleted successfully',
        deletedEmploymentId: id
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Update employee password
   * @param id - Employment ID
   * @param updatePasswordDto - Current and new password
   * @returns Success message
   */
  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    try {
      // Get employment record with password
      const employment = await this.employmentRepository.findOneByEmail(
        (await this.employmentRepository.findById(id))?.email
      );
      
      if (!employment) {
        throw new NotFoundException('Employment record not found');
      }

      // Check if employment has a password set
      if (!employment.password) {
        throw new UnprocessableEntityException(
          'No password set for this employment account. Please contact administrator.'
        );
      }

      // Verify current password
      const isPasswordValid = await comparePassword(
        updatePasswordDto.currentPassword, 
        employment.password
      );
      
      if (!isPasswordValid) {
        throw new UnprocessableEntityException('Current password is incorrect');
      }

      // Check if new password is different from current password
      const isSamePassword = await comparePassword(
        updatePasswordDto.newPassword, 
        employment.password
      );
      
      if (isSamePassword) {
        throw new UnprocessableEntityException('New password must be different from current password');
      }

      // Hash new password
      const hashedPassword = await hashPassword(updatePasswordDto.newPassword);

      // Update password
      const updatedEmployment = await this.employmentRepository.update(id, {
        password: hashedPassword
      });

      if (!updatedEmployment) {
        throw new NotFoundException('Failed to update password');
      }

      return {
        message: 'Password updated successfully',
        employmentId: id
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Submit quiz for employee with scoring: 1 mark per question, minimum 8/10 to pass
   * @param employmentId - Employment ID
   * @param courseId - Course ID
   * @param quizId - Quiz ID
   * @param answers - Array of answer indices
   * @returns Quiz result with score and pass status
   */
  async submitQuiz(employmentId: string, courseId: string, quizId: string, answers: number[]) {
    try {
      // Verify employment exists
      const employment = await this.employmentRepository.findById(employmentId);
      if (!employment) {
        throw new NotFoundException('Employment record not found');
      }

      // Verify quiz exists
      const quiz = await this.quizModel.findById(quizId).exec();
      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      // Verify course exists
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Check if quiz belongs to the course
      const quizBelongsToCourse = course.quizzes.some(q => q.toString() === quizId);
      if (!quizBelongsToCourse) {
        throw new BadRequestException('Quiz does not belong to this course');
      }

      // Calculate score: 1 mark per question
      const totalQuestions = quiz.questions.length;
      let correctAnswers = 0;

      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = correctAnswers; // 1 mark per correct answer
      
      // Determine pass status: minimum 8 out of 10 (80%)
      const passingThreshold = Math.ceil(totalQuestions * 0.8); // 80% passing score
      const isPassed = correctAnswers >= passingThreshold;

      // Save quiz attempt
      const quizAttempt = new this.quizAttemptModel({
        employmentId: new Types.ObjectId(employmentId),
        quizId: new Types.ObjectId(quizId),
        userAnswers: answers,
        score,
        totalQuestions,
        correctAnswers,
        isPassed,
        completedAt: new Date()
      });

      await quizAttempt.save();

      // Update progress if quiz is passed
      if (isPassed) {
        await this.markQuizComplete(employmentId, courseId, quizId);
      }

      return {
        message: isPassed ? 'Quiz passed successfully!' : 'Quiz submitted but not passed',
        attemptId: quizAttempt._id,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        percentage: Math.round((correctAnswers / totalQuestions) * 100),
        isPassed,
        passingThreshold,
        requiredScore: passingThreshold,
        feedback: isPassed 
          ? `Congratulations! You scored ${score}/${totalQuestions}` 
          : `You scored ${score}/${totalQuestions}. You need at least ${passingThreshold}/${totalQuestions} to pass.`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Mark video as complete for employee
   * @param employmentId - Employment ID
   * @param courseId - Course ID
   * @param videoId - Video ID
   * @returns Updated progress
   */
  async markVideoComplete(employmentId: string, courseId: string, videoId: string) {
    try {
      // Verify employment exists
      const employment = await this.employmentRepository.findById(employmentId);
      if (!employment) {
        throw new NotFoundException('Employment record not found');
      }

      // Verify course exists
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Verify video belongs to course
      const videoBelongsToCourse = course.videos.some(v => v.toString() === videoId);
      if (!videoBelongsToCourse) {
        throw new BadRequestException('Video does not belong to this course');
      }

      // Find or create progress record
      let progress = await this.userProgressModel.findOne({
        employmentId: new Types.ObjectId(employmentId),
        courseId: new Types.ObjectId(courseId)
      }).exec();

      if (!progress) {
        progress = new this.userProgressModel({
          employmentId: new Types.ObjectId(employmentId),
          courseId: new Types.ObjectId(courseId),
          completedVideos: [],
          completedQuizzes: [],
          progressPercentage: 0,
          isCourseCompleted: false
        });
      }

      // Add video to completed if not already there
      if (!progress.completedVideos.includes(videoId)) {
        progress.completedVideos.push(videoId);
      }

      // Update progress percentage
      await this.updateProgressPercentage(progress, course);
      await progress.save();

      return {
        message: 'Video marked as complete',
        progress: {
          completedVideos: progress.completedVideos.length,
          completedQuizzes: progress.completedQuizzes.length,
          progressPercentage: progress.progressPercentage,
          isCourseCompleted: progress.isCourseCompleted
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Mark quiz as complete for employee (private helper)
   */
  private async markQuizComplete(employmentId: string, courseId: string, quizId: string) {
    // Verify course exists
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Find or create progress record
    let progress = await this.userProgressModel.findOne({
      employmentId: new Types.ObjectId(employmentId),
      courseId: new Types.ObjectId(courseId)
    }).exec();

    if (!progress) {
      progress = new this.userProgressModel({
        employmentId: new Types.ObjectId(employmentId),
        courseId: new Types.ObjectId(courseId),
        completedVideos: [],
        completedQuizzes: [],
        progressPercentage: 0,
        isCourseCompleted: false
      });
    }

    // Add quiz to completed if not already there
    if (!progress.completedQuizzes.includes(quizId)) {
      progress.completedQuizzes.push(quizId);
    }

    // Update progress percentage
    await this.updateProgressPercentage(progress, course);
    await progress.save();

    return progress;
  }

  /**
   * Get employee progress for a course
   * @param employmentId - Employment ID
   * @param courseId - Course ID
   * @returns Progress details
   */
  async getEmployeeProgress(employmentId: string, courseId: string) {
    try {
      // Verify employment exists
      const employment = await this.employmentRepository.findById(employmentId);
      if (!employment) {
        throw new NotFoundException('Employment record not found');
      }

      // Verify course exists
      const course = await this.courseModel.findById(courseId)
        .populate('videos')
        .populate('quizzes')
        .exec();
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Find progress record
      let progress = await this.userProgressModel.findOne({
        employmentId: new Types.ObjectId(employmentId),
        courseId: new Types.ObjectId(courseId)
      }).exec();

      if (!progress) {
        // Create initial progress record
        progress = new this.userProgressModel({
          employmentId: new Types.ObjectId(employmentId),
          courseId: new Types.ObjectId(courseId),
          completedVideos: [],
          completedQuizzes: [],
          progressPercentage: 0,
          isCourseCompleted: false
        });
        await progress.save();
      }

      // Get quiz attempts
      const quizAttempts = await this.quizAttemptModel.find({
        employmentId: new Types.ObjectId(employmentId),
        quizId: { $in: course.quizzes }
      }).populate('quizId', 'title').exec();

      return {
        employmentId,
        courseId,
        courseName: course.title,
        progress: {
          completedVideos: progress.completedVideos.length,
          totalVideos: course.videos.length,
          completedQuizzes: progress.completedQuizzes.length,
          totalQuizzes: course.quizzes.length,
          progressPercentage: progress.progressPercentage,
          isCourseCompleted: progress.isCourseCompleted
        },
        quizAttempts: quizAttempts.map(attempt => ({
          quizId: attempt.quizId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          isPassed: attempt.isPassed,
          completedAt: attempt.completedAt
        })),
        completedVideoIds: progress.completedVideos,
        completedQuizIds: progress.completedQuizzes
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Get all quiz attempts for an employee
   * @param employmentId - Employment ID
   * @param quizId - Optional quiz ID to filter
   * @returns List of quiz attempts
   */
  async getEmployeeQuizAttempts(employmentId: string, quizId?: string) {
    try {
      const query: any = { employmentId: new Types.ObjectId(employmentId) };
      if (quizId) {
        query.quizId = new Types.ObjectId(quizId);
      }

      const attempts = await this.quizAttemptModel.find(query)
        .populate('quizId', 'title description')
        .sort({ completedAt: -1 })
        .exec();

      return {
        totalAttempts: attempts.length,
        attempts: attempts.map(attempt => ({
          attemptId: attempt._id,
          quizId: attempt.quizId,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          wrongAnswers: attempt.totalQuestions - attempt.correctAnswers,
          percentage: Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100),
          isPassed: attempt.isPassed,
          completedAt: attempt.completedAt
        }))
      };
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  /**
   * Update progress percentage based on completed items
   * @param progress - Progress document
   * @param course - Course document
   */
  private async updateProgressPercentage(progress: any, course: any): Promise<void> {
    const totalVideos = course.videos.length;
    const totalQuizzes = course.quizzes.length;
    const totalItems = totalVideos + totalQuizzes;

    if (totalItems === 0) {
      progress.progressPercentage = 0;
      progress.isCourseCompleted = false;
      return;
    }

    const completedItems = progress.completedVideos.length + progress.completedQuizzes.length;
    progress.progressPercentage = Math.round((completedItems / totalItems) * 100);

    // Mark course as completed if all items are done
    if (completedItems === totalItems) {
      progress.isCourseCompleted = true;
    }
  }

  async checkEmploymentStatus(email: string) {
    const employment = await this.employmentRepository.findOneByEmail(email);
    if (!employment) {
      throw new NotFoundException('Employment record not found');
    }
    return employment;
  }

  async sendReminderEmailsToInactiveAccounts(): Promise<any> {
    try {
      // Find all inactive employment accounts (accounts that haven't been activated yet)
      const inactiveAccounts = await this.employmentRepository.findAllInactive();
      
      const results = {
        total: inactiveAccounts.length,
        sent7Day: 0,
        sent15Day: 0,
        errors: [],
      };

      const currentDate = new Date();

      for (const employment of inactiveAccounts) {
        try {
          // Get the creation date
          const createdAt = (employment as any).createdAt;
          if (!createdAt) {
            continue;
          }

          const daysDiff = Math.floor((currentDate.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

          // Get the user's group and assigned courses
          if (employment.groupId) {
            const group = await this.groupModel.findById(employment.groupId).exec();
            if (group && group.courses && group.courses.length > 0) {
              // Get the first assigned course (you can modify this logic as needed)
              const courseId = group.courses[0].courseId;
              const course = await this.courseModel.findById(courseId).exec();

              if (course) {
                // Get frontend URL from ServerUtils
                const frontendUrl = ServerUtils.getFrontendUrl();
                const signupLink = `${frontendUrl}/signup?email=${employment.email}&name=${employment.fullName}&role=${employment.role}`;

                // Send 7-day reminder
                if (daysDiff === 7 || daysDiff === 8) {
                  await this.emailService.send7DayReminderEmail(
                    employment.email,
                    employment.fullName,
                    course.title,
                    signupLink
                  );
                  results.sent7Day++;
                }

                // Send 15-day reminder
                if (daysDiff === 15 || daysDiff === 16) {
                  await this.emailService.send15DayReminderEmail(
                    employment.email,
                    employment.fullName,
                    course.title,
                    signupLink
                  );
                  results.sent15Day++;
                }
              }
            }
          }
        } catch (error) {
          results.errors.push({
            email: employment.email,
            error: error.message,
          });
        }
      }

      return {
        message: 'Reminder emails processed',
        results,
      };
    } catch (error) {
      throw new Error(`Failed to send reminder emails: ${error.message}`);
    }
  }

  async sendOverdueReminderEmails(): Promise<any> {
    try {
      // Get all active employment accounts
      const activeAccounts = await this.employmentRepository.find({ isActive: true });
      
      const results = {
        total: 0,
        sent7Day: 0,
        sent15Day: 0,
        sent24Hour: 0,
        errors: [],
      };

      const currentDate = new Date();

      for (const employment of activeAccounts) {
        try {
          if (!employment.groupId) {
            continue;
          }

          // Get the employee's group and assigned courses
          const group = await this.groupModel.findById(employment.groupId).exec();
          if (!group || !group.courses || group.courses.length === 0) {
            continue;
          }

          // Check each course for the employee
          for (const courseAssignment of group.courses) {
            const course = await this.courseModel.findById(courseAssignment.courseId).exec();
            if (!course) {
              continue;
            }

            // Check if course is overdue
            const isOverdue = new Date(courseAssignment.dueDate) < currentDate;
            if (!isOverdue) {
              continue;
            }

            // Get employee's progress for this course
            const progress = await this.userProgressModel.findOne({
              courseId: courseAssignment.courseId,
              $or: [
                { userId: employment.userId },
                { employmentId: employment._id }
              ]
            }).exec();

            // Check if course is completed
            if (progress && progress.isCourseCompleted) {
              continue;
            }

            results.total++;

            const daysOverdue = Math.floor((currentDate.getTime() - new Date(courseAssignment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            const frontendUrl = ServerUtils.getFrontendUrl();
            const loginLink = `${frontendUrl}/login?email=${employment.email}`;

            // Calculate final deadline (due date + 30 days)
            const finalDeadline = new Date(courseAssignment.dueDate);
            finalDeadline.setDate(finalDeadline.getDate() + 30);
            const hoursUntilFinal = Math.floor((finalDeadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60));

            // Send 7-day overdue reminder
            if (daysOverdue === 7 || daysOverdue === 8) {
              await this.emailService.send7DayOverdueReminderEmail(
                employment.email,
                employment.fullName,
                course.title,
                new Date(courseAssignment.dueDate),
                loginLink
              );
              results.sent7Day++;
            }

            // Send 15-day overdue reminder
            if (daysOverdue === 15 || daysOverdue === 16) {
              await this.emailService.send15DayOverdueReminderEmail(
                employment.email,
                employment.fullName,
                course.title,
                new Date(courseAssignment.dueDate),
                loginLink
              );
              results.sent15Day++;
            }

            // Send 24-hour final reminder (when 29 days overdue, 24 hours before 30-day deadline)
            if (hoursUntilFinal <= 24 && hoursUntilFinal > 0) {
              await this.emailService.send24HourFinalReminderEmail(
                employment.email,
                employment.fullName,
                course.title,
                finalDeadline,
                loginLink
              );
              results.sent24Hour++;
            }
          }
        } catch (error) {
          results.errors.push({
            email: employment.email,
            error: error.message,
          });
        }
      }

      return {
        message: 'Overdue reminder emails processed',
        results,
      };
    } catch (error) {
      throw new Error(`Failed to send overdue reminder emails: ${error.message}`);
    }
  }
}

