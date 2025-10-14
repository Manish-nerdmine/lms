import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { UpdateEmploymentDto } from './dto/update-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';
import { EmploymentRepository } from './employment.repository';
import { PasscodeService } from '../passcode/passcode.service';
import { getHashKeys, comparePassword, hashPassword } from '../utils/common.utils';
import { Group } from '@app/common/models/group.schema';
import { Department } from '@app/common/models/department.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { Video, Quiz } from '@app/common/models/lms.schema';
import * as XLSX from 'xlsx';

@Injectable()
export class EmploymentService {
  constructor(
    private readonly employmentRepository: EmploymentRepository,
    private readonly passcodeService: PasscodeService,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Department.name) private readonly departmentModel: Model<Department>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>
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
            results.failed.push({
              row,
              reason: 'Missing required fields: fullName, email, or role',
            });
            continue;
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
      throw new BadRequestException(`Failed to process Excel file: ${error.message}`);
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
}

