import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '@app/common/models/user.schema';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { hashPassword } from '../utils/common.utils';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new super admin user
   */
  async createSuperAdmin(createSuperAdminDto: CreateSuperAdminDto) {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email: createSuperAdminDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(createSuperAdminDto.password);

    // Create super admin user
    const superAdmin = new this.userModel({
      ...createSuperAdminDto,
      password: hashedPassword,
      userType: 'admin',
      isSuperAdmin: true,
      isTermsAccepted: true,
    });

    await superAdmin.save();

    // Remove password from response
    const { password, ...result } = superAdmin.toObject();

    return {
      message: 'Super admin created successfully',
      superAdmin: result,
    };
  }

  /**
   * Toggle super admin status for a user
   */
  async toggleSuperAdminStatus(userId: string, isSuperAdmin: boolean) {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isSuperAdmin = isSuperAdmin;
    await user.save();

    return {
      message: `User ${isSuperAdmin ? 'promoted to' : 'removed from'} super admin successfully`,
      userId: user._id,
      isSuperAdmin: user.isSuperAdmin,
    };
  }

  /**
   * Get all super admins
   */
  async getAllSuperAdmins() {
    const superAdmins = await this.userModel
      .find({ isSuperAdmin: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return {
      total: superAdmins.length,
      superAdmins,
    };
  }

  /**
   * Check if a user is super admin
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    return user?.isSuperAdmin === true;
  }

  /**
   * Remove super admin status
   */
  async removeSuperAdmin(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isSuperAdmin) {
      throw new BadRequestException('User is not a super admin');
    }

    user.isSuperAdmin = false;
    await user.save();

    return {
      message: 'Super admin status removed successfully',
      userId: user._id,
    };
  }
}

