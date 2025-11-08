import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { GetUserDto } from './dto/get-user.dto';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { UsersRepository } from './users.repository';
import { PasscodeService } from '../passcode/passcode.service';
import { getHashKeys, comparePassword, hashPassword } from '../utils/common.utils';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import { Group } from '@app/common/models/group.schema';
import { Department } from '@app/common/models/department.schema';
import { EmploymentRepository } from '../employment/employment.repository';


@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository, 
    private readonly passcodeService: PasscodeService,
    private readonly employmentRepository: EmploymentRepository,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Department.name) private readonly departmentModel: Model<Department>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      await this.validateCreateUserDto(createUserDto);
      
      // If groupId is provided, validate it exists
      if (createUserDto.groupId) {
        const group = await this.groupModel.findById(createUserDto.groupId).exec();
        if (!group) {
          throw new NotFoundException('Group not found');
        }
      }

      // Create the user
      const createdUser = await this.usersRepository.createUser(createUserDto);

      return createdUser;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new UnprocessableEntityException(err.message);
    }
  }
  

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists.');
  }

  async Login(loginAuthDto: LoginAuthDto) {
    const user = await this.usersRepository.findOne({ email: loginAuthDto?.email }, {password: 1, _id: 1});
    if (!user) {
      throw new UnprocessableEntityException('Invalid Email.');
    }
    const passwordIsValid = await comparePassword(loginAuthDto?.password, user.password);
    console.log(passwordIsValid);
    // if (!passwordIsValid) {
    //   throw new UnprocessableEntityException('Invald Passeord .');
    // }
 
    const passcode = await getHashKeys();
    const passcodePayload = {
      user: user._id,
      passcode,
    };
    const passcodeInfo = await this.passcodeService.create(passcodePayload)
    return {
      user: user?._id,
      passcode: passcodeInfo.passcode,
    };
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }

  async getUserById(id: string) {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('User not found');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Check if user exists
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // If email is being updated, check for duplicates
      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        try {
          const userWithEmail = await this.usersRepository.findOne({ email: updateUserDto.email });
          if (userWithEmail && userWithEmail._id.toString() !== id) {
            throw new ConflictException('Email already exists');
          }
        } catch (err) {
          // Email doesn't exist, continue
        }
      }

      // If groupId is provided, validate it exists and check for course assignments
    

  



      const updatedUser = await this.usersRepository.findOneAndUpdate({ _id: id }, updateUserDto);
      
      return {
        message: 'User updated successfully',
        success: true,
        data: updatedUser
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserPassword(id: string, updatePasswordDto: UpdateUserPasswordDto) {
    try {
      const user = await this.usersRepository.findByIdWithPassword(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.password) {
        throw new UnprocessableEntityException('No password set for this user. Please contact administrator.');
      }

      const isCurrentValid = await comparePassword(updatePasswordDto.currentPassword, user.password);
      if (!isCurrentValid) {
        throw new UnprocessableEntityException('Current password is incorrect');
      }

      const isSamePassword = await comparePassword(updatePasswordDto.newPassword, user.password);
      if (isSamePassword) {
        throw new UnprocessableEntityException('New password must be different from current password');
      }

      const hashedPassword = await hashPassword(updatePasswordDto.newPassword);
      await this.usersRepository.findByIdAndUpdate(id, { password: hashedPassword });

      return {
        message: 'Password updated successfully',
        success: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new UnprocessableEntityException(error.message);
    }
  }

  async deleteUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Check if user belongs to a group with assigned courses
      if (existingUser.groupId) {
        const group = await this.groupModel.findById(existingUser.groupId).exec();
        if (group && group.courses && group.courses.length > 0) {
          throw new ForbiddenException(
            'Cannot delete user from group with assigned courses. Please remove course assignments first.'
          );
        }
      }

      // Delete user
      await this.usersRepository.findByIdAndDelete(id);
      
      return {
        message: 'User deleted successfully',
        deletedUserId: id
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Error deleting user');
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string, userId?: string) {
   
    const skip = (page - 1) * limit;
    const matchQuery: any = {
      status: true,
      deleted: false,
    };



    // Use aggregation pipeline to lookup userType and group details
    const pipeline = [
      { $match: matchQuery },
     
     
      {
        $lookup: {
          from: 'groups', // MongoDB collection name for Group
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
      },
      {
        $lookup: {
          from: 'employmentdocuments', // MongoDB collection name for Employment
          localField: '_id',
          foreignField: 'userId',
          as: 'employmentDetails'
        }
      },
      {
        $unwind: {
          path: '$employmentDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Filter by userId if provided
      ...(userId ? [{
        $match: {
          'employmentDetails.userId': new Types.ObjectId(userId)
        }
      }] : []),
      // Search across user and employment fields
      ...(search ? [{
        $match: {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
            { 'employmentDetails.fullName': { $regex: search, $options: 'i' } },
            { 'employmentDetails.email': { $regex: search, $options: 'i' } },
            { 'employmentDetails.role': { $regex: search, $options: 'i' } },
          ]
        }
      }] : []),
     
              {
          $project: {
            fullName: '$employmentDetails.fullName',
            email: '$employmentDetails.email',
            role: '$employmentDetails.role',
            isActive: '$employmentDetails.isActive',
            lastLoggedIn: '$employmentDetails.lastLoggedIn',
            groupName: '$groupDetails.name',
            
          }
        },
      { $skip: skip },
      { $limit: limit }
    ];

    try {
      // Get the total count with the same filters
      const countPipeline = [
        { $match: matchQuery },
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
        },
        {
          $lookup: {
            from: 'employmentdocuments',
            localField: '_id',
            foreignField: 'userId',
            as: 'employmentDetails'
          }
        },
        {
          $unwind: {
            path: '$employmentDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        ...(userId ? [{
          $match: {
            'employmentDetails.userId': new Types.ObjectId(userId)
          }
        }] : []),
        ...(search ? [{
          $match: {
            $or: [
              { fullName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { companyName: { $regex: search, $options: 'i' } },
              { 'employmentDetails.fullName': { $regex: search, $options: 'i' } },
              { 'employmentDetails.email': { $regex: search, $options: 'i' } },
              { 'employmentDetails.role': { $regex: search, $options: 'i' } },
            ]
          }
        }] : []),
        { $count: 'total' }
      ];

      const users = await this.usersRepository.aggregate(pipeline);
      const countResult = await this.usersRepository.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Aggregation error:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUsersByGroup(groupId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { groupId };

    const users = await this.usersRepository.find(query, {}, { skip, limit });
    const total = await this.usersRepository.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUsersByDepartment(departmentId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { departmentId };

    const users = await this.usersRepository.find(query, {}, { skip, limit });
    const total = await this.usersRepository.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async uploadUsersFromExcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
      throw new BadRequestException('Invalid file format. Please upload an Excel file (.xlsx or .xls)');
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        const rowNumber = i + 2; // +2 because Excel is 1-indexed and we have headers

        try {
          // Validate required fields
          if (!row.fullName || !row.email ) {
            results.failed++;
            results.errors.push(`Row ${rowNumber}: Missing required fields (fullName, email, password)`);
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row.email)) {
            results.failed++;
            results.errors.push(`Row ${rowNumber}: Invalid email format`);
            continue;
          }

          // Validate groupId format if provided
          if (row.groupId && !/^[0-9a-fA-F]{24}$/.test(row.groupId)) {
            results.failed++;
            results.errors.push(`Row ${rowNumber}: Invalid groupId format (must be a valid MongoDB ObjectId)`);
            continue;
          }

          // Validate group exists if groupId is provided
          if (row.groupId) {
            const group = await this.groupModel.findById(row.groupId).exec();
            if (!group) {
              results.failed++;
              results.errors.push(`Row ${rowNumber}: Group with ID ${row.groupId} does not exist`);
              continue;
            }
          }

        

          // Validate department exists if departmentId is provided
         
          // Check if user already exists
          try {
            await this.usersRepository.findOne({ email: row.email });
            results.failed++;
            results.errors.push(`Row ${rowNumber}: Email already exists`);
            continue;
          } catch (err) {
            // User doesn't exist, continue with creation
          }

          // Create user
          const userData = {
            fullName: row.fullName,
            email: row.email,

            userType: row.userType || 'user',
            companyName: row.companyName || '',
            country: row.country || '',
            isTermsAccepted: row.isTermsAccepted === 'true' || row.isTermsAccepted === true,
            groupId: row.groupId || undefined,
          
          };

          await this.usersRepository.createUser(userData);
          results.success++;

        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      return {
        message: 'Excel upload completed',
        results,
      };

    } catch (error) {
      throw new BadRequestException(`Error processing Excel file: ${error.message}`);
    }
  }

  async downloadTemplate() {
    const template = [
      {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Software',
      },
      {
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Developer',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Template');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      buffer,
      filename: 'users_template.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

}
