import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '@app/common/models/user.schema';
import { EmploymentDocument } from '@app/common/models/employment.schema';
import { Course, UserProgress } from '@app/common/models/lms.schema';
import { Group } from '@app/common/models/group.schema';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { hashPassword } from '../utils/common.utils';
import * as XLSX from 'xlsx';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(EmploymentDocument.name) private readonly employmentModel: Model<EmploymentDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(UserProgress.name) private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
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

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Get total users count
      const totalUsers = await this.userModel.countDocuments({
        status: true,
        deleted: false,
      }).exec();

      // Get total courses count
      const totalCourses = await this.courseModel.countDocuments({}).exec();

      // Get total employed users count (active employment records)
      const totalEmployedUsers = await this.employmentModel.countDocuments({
        isActive: true,
      }).exec();

      return {
        totalUsers,
        totalCourses,
        totalEmployedUsers,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get complete user information by userId
   */
  async getUserDetails(userId: string) {
    try {
      // Find the user with populated fields
      const user = await this.userModel
        .findById(userId)
        .select('-password')
        .populate('groupId', 'name')
        .populate('departmentId', 'name')
        .exec();
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find employment record if exists with populated fields
      const employment = await this.employmentModel
        .findOne({ userId })
        .populate('groupId', 'name')
        .exec();

      // Get user progress with course details
      const userProgress = await this.userProgressModel
        .find({ userId })
        .populate('courseId', 'title description thumbnail')
        .exec();

      // Get total courses user is enrolled in
      const totalCourses = userProgress.length;
      
      // Calculate completed courses
      const completedCourses = userProgress.filter(
        progress => progress.progressPercentage >= 100
      ).length;

      // Compile complete user information
      const userDetails = {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          companyName: user.companyName,
          country: user.country,
          userType: user.userType,
          isSuperAdmin: user.isSuperAdmin,
          isTermsAccepted: user.isTermsAccepted,
          groupId: user.groupId,
          departmentId: user.departmentId,
          companyId: user.companyId,
          lastLoggedIn: user.lastLoggedIn,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        employment: employment ? {
          _id: employment._id,
          fullName: employment.fullName,
          email: employment.email,
          role: employment.role,
          groupId: employment.groupId,
          isActive: employment.isActive,
          lastLoggedIn: employment.lastLoggedIn,
          createdAt: employment.createdAt,
          updatedAt: employment.updatedAt,
        } : null,
        progress: userProgress || [],
        statistics: {
          totalCourses,
          completedCourses,
          inProgressCourses: totalCourses - completedCourses,
          averageProgress: totalCourses > 0 
            ? Math.round(
                (userProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / totalCourses) * 100
              ) / 100
            : 0,
        },
      };

      return userDetails;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch user details: ${error.message}`);
    }
  }

  /**
   * Export user complete information to Excel
   */
  async exportUserToExcel(userId: string) {
    try {
      // Find the user
      const user = await this.userModel.findById(userId).select('-password').exec();
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find employment record if exists
      const employment = await this.employmentModel
        .findOne({ userId })
        .exec();

      // Get user progress with course details
      const userProgress = await this.userProgressModel
        .find({ userId })
        .populate('courseId', 'title description')
        .exec();

      // Get group details if exists
      let groupDetails = null;
      if (user.groupId) {
        groupDetails = await this.groupModel.findById(user.groupId).exec();
      }
      if (!groupDetails && employment && employment.groupId) {
        groupDetails = await this.groupModel.findById(employment.groupId).exec();
      }

      // Create Excel workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: User Information
      const userData = [{
        'Field': 'Full Name',
        'Value': user.fullName || ''
      }, {
        'Field': 'Email',
        'Value': user.email || ''
      }, {
        'Field': 'Phone',
        'Value': user.phone || ''
      }, {
        'Field': 'Company Name',
        'Value': user.companyName || ''
      }, {
        'Field': 'Country',
        'Value': user.country || ''
      }, {
        'Field': 'User Type',
        'Value': user.userType || ''
      }, {
        'Field': 'Company ID',
        'Value': user.companyId || ''
      }, {
        'Field': 'Is Super Admin',
        'Value': user.isSuperAdmin ? 'Yes' : 'No'
      }, {
        'Field': 'Terms Accepted',
        'Value': user.isTermsAccepted ? 'Yes' : 'No'
      }, {
        'Field': 'Group Name',
        'Value': groupDetails ? groupDetails.name : 'N/A'
      }, {
        'Field': 'Last Logged In',
        'Value': user.lastLoggedIn ? new Date(user.lastLoggedIn).toLocaleString() : 'Never'
      }, {
        'Field': 'Created At',
        'Value': user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
      }, {
        'Field': 'Updated At',
        'Value': user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''
      }];

      const userWorksheet = XLSX.utils.json_to_sheet(userData);
      XLSX.utils.book_append_sheet(workbook, userWorksheet, 'User Information');

      // Sheet 2: Employment Information
      const employmentData = employment ? [{
        'Field': 'Full Name',
        'Value': employment.fullName || ''
      }, {
        'Field': 'Email',
        'Value': employment.email || ''
      }, {
        'Field': 'Role',
        'Value': employment.role || ''
      }, {
        'Field': 'Is Active',
        'Value': employment.isActive ? 'Yes' : 'No'
      }, {
        'Field': 'Last Logged In',
        'Value': employment.lastLoggedIn ? new Date(employment.lastLoggedIn).toLocaleString() : 'Never'
      }, {
        'Field': 'Created At',
        'Value': employment.createdAt ? new Date(employment.createdAt).toLocaleString() : ''
      }, {
        'Field': 'Updated At',
        'Value': employment.updatedAt ? new Date(employment.updatedAt).toLocaleString() : ''
      }] : [{
        'Field': 'Status',
        'Value': 'No Employment Record'
      }];

      const employmentWorksheet = XLSX.utils.json_to_sheet(employmentData);
      XLSX.utils.book_append_sheet(workbook, employmentWorksheet, 'Employment Information');

      // Sheet 3: Group Information
      const groupData = groupDetails ? [{
        'Field': 'Group Name',
        'Value': groupDetails.name || ''
      }, {
        'Field': 'Description',
        'Value': groupDetails.description || ''
      }, {
        'Field': 'Total Courses',
        'Value': groupDetails.courses ? groupDetails.courses.length : 0
      }, {
        'Field': 'Created At',
        'Value': groupDetails.createdAt ? new Date(groupDetails.createdAt).toLocaleString() : ''
      }, {
        'Field': 'Updated At',
        'Value': groupDetails.updatedAt ? new Date(groupDetails.updatedAt).toLocaleString() : ''
      }] : [{
        'Field': 'Status',
        'Value': 'No Group Assigned'
      }];

      const groupWorksheet = XLSX.utils.json_to_sheet(groupData);
      XLSX.utils.book_append_sheet(workbook, groupWorksheet, 'Group Information');

      // Sheet 4: Course Progress
      const courseProgressData = userProgress.map((progress: any, index: number) => ({
        'No': index + 1,
        'Course Title': progress.courseId?.title || 'N/A',
        'Progress Percentage': `${progress.progressPercentage || 0}%`,
        'Completed Videos': progress.completedVideos?.length || 0,
        'Completed Quizzes': progress.completedQuizzes?.length || 0,
        'Last Updated': progress.updatedAt ? new Date(progress.updatedAt).toLocaleString() : ''
      }));

      if (courseProgressData.length === 0) {
        courseProgressData.push({
          'No': 1,
          'Course Title': 'No courses enrolled',
          'Progress Percentage': '0%',
          'Completed Videos': 0,
          'Completed Quizzes': 0,
          'Last Updated': ''
        });
      }

      const courseWorksheet = XLSX.utils.json_to_sheet(courseProgressData);
      XLSX.utils.book_append_sheet(workbook, courseWorksheet, 'Course Progress');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return {
        buffer,
        filename: `${user.fullName}_${Date.now()}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to export user to Excel: ${error.message}`);
    }
  }
}

