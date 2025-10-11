import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';
import { EmploymentRepository } from './employment.repository';
import { PasscodeService } from '../passcode/passcode.service';
import { getHashKeys, comparePassword, hashPassword } from '../utils/common.utils';
import { Group } from '@app/common/models/group.schema';
import { Department } from '@app/common/models/department.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { Video, Quiz } from '@app/common/models/lms.schema';

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
      if (createEmploymentDto.userId) {
        user = await this.userModel.findById(createEmploymentDto.userId).exec();
      }
      if (!user) {
        throw new BadRequestException('User not found. Please ensure user exists before creating employment record.');
      }

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
            role: createEmploymentDto.role || existingEmployment.role,
            fullName: createEmploymentDto.fullName || existingEmployment.fullName,
          }
        );

        return {
          message: 'Employment account activated successfully',
          employment: updatedEmployment
        };
      }

      // Hash password if provided
      if (createEmploymentDto.password) {
        createEmploymentDto.password = await hashPassword(createEmploymentDto.password);
      }

      // Set isActive to true for new employment records
      const employmentData = {
        ...createEmploymentDto,
        userId: createEmploymentDto.userId,
        isActive: false,
      };

      return await this.employmentRepository.createEmployment(employmentData, user._id);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof ForbiddenException) {
        throw err;
      }
      throw new UnprocessableEntityException(err.message);
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

    // Find user by email
    const user = await this.userModel.findOne({ email: loginEmploymentDto.email }).exec();
    if (!user) {
      throw new UnprocessableEntityException('User not found in User schema.');
    }

    // Find group (if exists)
    const group = user.groupId
      ? await this.groupModel.findOne({ _id: user.groupId }).exec()
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

  async getAllEmployments(userId?: string) {
    try {
  console.log('userId', userId);
      if (userId) {
        return await this.employmentRepository.find({ userId: new Types.ObjectId(userId) });
      }
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
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
  async updateEmployment(id: string, updateData: any) {
    try {
      // Check if employment exists
      const existingEmployment = await this.employmentRepository.findById(id);
      if (!existingEmployment) {
        throw new NotFoundException('Employment record not found');
      }

      // If groupId is being updated, validate it exists and check for course assignments
      if (updateData.groupId) {
        const group = await this.groupModel.findById(updateData.groupId).exec();
        if (!group) {
          throw new NotFoundException('Group not found');
        }
        
        // Check if the group has courses assigned
        if (group.courses && group.courses.length > 0) {
          throw new ForbiddenException(
            'Cannot assign employee to group with assigned courses. Please remove course assignments first.'
          );
        }
      }

      // If employment is being moved from a group with courses, prevent the update
      if (existingEmployment.groupId && updateData.groupId !== existingEmployment.groupId) {
        const currentGroup = await this.groupModel.findById(existingEmployment.groupId).exec();
        if (currentGroup && currentGroup.courses && currentGroup.courses.length > 0) {
          throw new ForbiddenException(
            'Cannot move employee from group with assigned courses. Please remove course assignments first.'
          );
        }
      }

      const updatedEmployment = await this.employmentRepository.update(id, updateData);
      
      return {
        message: 'Employment updated successfully',
        employment: updatedEmployment
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
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

