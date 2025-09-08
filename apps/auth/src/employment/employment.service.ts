import { Injectable, UnprocessableEntityException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';
import { EmploymentRepository } from './employment.repository';
import { PasscodeService } from '../passcode/passcode.service';
import { getHashKeys, comparePassword } from '../utils/common.utils';
import { Group } from '@app/common/models/group.schema';
import { Department } from '@app/common/models/department.schema';
import { UserDocument } from '@app/common/models/user.schema';

@Injectable()
export class EmploymentService {
  constructor(
    private readonly employmentRepository: EmploymentRepository,
    private readonly passcodeService: PasscodeService,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Department.name) private readonly departmentModel: Model<Department>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>
  ) {}

  async create(createEmploymentDto: CreateEmploymentDto) {
    try {
      await this.validateCreateEmploymentDto(createEmploymentDto);
      



      // Check if user with this email exists (this is allowed for employment)
      const existingUser = await this.userModel.findOne({ email: createEmploymentDto.email }).exec();
      if (!existingUser) {
        throw new BadRequestException('Email must exist in user schema to create employment record');
      }

      // Set isActive to true by default
      createEmploymentDto['isActive'] = true;

      return await this.employmentRepository.createEmployment(createEmploymentDto);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
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

  async login(loginEmploymentDto: LoginEmploymentDto) {
    const employment = await this.employmentRepository.findOneByEmail(loginEmploymentDto.email);
    if (!employment) {
      throw new UnprocessableEntityException('Invalid Email.');
    }

    if (!employment.isActive) {
      throw new UnprocessableEntityException('Employment account is not active.');
    }

    const passwordIsValid = await comparePassword(loginEmploymentDto.password, employment.password);
    if (!passwordIsValid) {
      throw new UnprocessableEntityException('Invalid Password.');
    }

    const passcode = await getHashKeys();
    const passcodePayload = {
      user: employment._id,
      passcode,
    };
    const passcodeInfo = await this.passcodeService.create(passcodePayload);
    
    return {
      employment: employment._id,
      passcode: passcodeInfo.passcode,
      role: employment.role,
      groupId: employment.groupId,
    };
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
      return await this.employmentRepository.find({ groupId, isActive: true });
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }
}

