import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from '@app/common/models/group.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { EmploymentDocument } from '@app/common/models/employment.schema';
import { Course } from '@app/common/models/lms.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(EmploymentDocument.name) private readonly employmentModel: Model<EmploymentDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Check if a group has any courses assigned
   * @param groupId - The group ID to check
   * @returns boolean indicating if group has courses assigned
   */
  private async hasCoursesAssigned(groupId: string): Promise<boolean> {
    const group = await this.groupModel.findById(groupId).exec();
    return group && group.courses && group.courses.length > 0;
  }

  /**
   * Validate that group modifications are allowed (no courses assigned)
   * @param groupId - The group ID to validate
   * @throws ForbiddenException if group has courses assigned
   */
  private async validateGroupModificationAllowed(groupId: string): Promise<void> {
    const hasCourses = await this.hasCoursesAssigned(groupId);
    if (hasCourses) {
      throw new ForbiddenException(
        'Cannot modify group membership when courses are assigned. Please remove all course assignments first.'
      );
    }
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    // Check if group name already exists
    const existingGroup = await this.groupModel.findOne({ 
      name: createGroupDto.name
    }).exec();
    
    if (existingGroup) {
      throw new ConflictException('Group with this name already exists');
    }

    const group = new this.groupModel(createGroupDto);
    return group.save();
  }

  async findAll(userId?: string): Promise<Group[]> {
    const filter = userId ? { userId } : {};
    return this.groupModel
      .find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllWithStats(page: number = 1, limit: number = 10, userId?: string) {
    // Ensure page and limit are valid numbers
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, parseInt(String(limit)) || 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Use aggregation to get groups with user and employee counts
    const pipeline = [
      {
        $match: {
          userId: new Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'userdocuments', // MongoDB collection name for User
          localField: '_id',
          foreignField: 'groupId',
          as: 'users'
        }
      },
      {
        $lookup: {
          from: 'employmentdocuments', // MongoDB collection name for Employment
          localField: '_id',
          foreignField: 'groupId',
          as: 'employees'
        }
      },
      {
        $addFields: {
          totalUsers: { $size: '$users' },
          totalEmployees: { $size: '$employees' },
          totalMembers: { $add: [{ $size: '$users' }, { $size: '$employees' }] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          totalUsers: 1,
          totalEmployees: 1,
          totalMembers: 1,
          //completionRate: 1,
         // users: 0 // Remove the users array, keep only the count
        }
      },
      {
        $sort: { createdAt: -1 as const }
      },
      { $skip: skip },
      { $limit: limitNum }
    ];

    // Get total count for pagination
    const countPipeline = [
      {
        $lookup: {
          from: 'userdocuments',
          localField: '_id',
          foreignField: 'groupId',
          as: 'users'
        }
      },
      {
        $addFields: {
          totalUsers: { $size: '$users' },
          userIds: '$users._id'
        }
      },
      {
        $lookup: {
          from: 'userprogresses',
          localField: 'userIds',
          foreignField: 'userId',
          as: 'userProgress'
        }
      },
      {
        $addFields: {
          totalProgressEntries: { $size: '$userProgress' },
          totalProgressPercentage: {
            $sum: '$userProgress.progressPercentage'
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $cond: {
              if: { $gt: ['$totalProgressEntries', 0] },
              then: {
                $round: [
                  { $divide: ['$totalProgressPercentage', '$totalProgressEntries'] },
                  2
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $count: 'total'
      }
    ];

    try {
      const [groups, countResult] = await Promise.all([
        this.groupModel.aggregate(pipeline).exec(),
        this.groupModel.aggregate(countPipeline).exec()
      ]);

      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Ensure every group has a completionRate field
      const groupsWithCompletionRate = groups.map(group => ({
        ...group,
        completionRate: group.completionRate || 0
      }));

      return {
        groups: groupsWithCompletionRate,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error('Aggregation error:', error);
      throw new Error(`Failed to fetch groups: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel.findById(id).populate('userId', 'fullName email').exec();
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async findOneWithUsers(id: string): Promise<any> {
    const pipeline = [
      {
        $match: { _id: new Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'employmentdocuments',
          localField: '_id',
          foreignField: 'groupId',
          as: 'employees'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $addFields: {
          totalUsers: { $size: { $ifNull: ['$employees', []] } },
          totalCourses: { $size: { $ifNull: ['$courses', []] } },
          coursesWithDetails: {
            $cond: {
              if: { $isArray: '$courses' },
              then: {
                $map: {
                  input: '$courses',
                  as: 'course',
                  in: {
                    $mergeObjects: [
                      '$$course',
                      {
                        courseDetails: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$courseDetails',
                                as: 'detail',
                                cond: { $eq: ['$$detail._id', '$$course.courseId'] }
                              }
                            },
                            0
                          ]
                        }
                      }
                    ]
                  }
                }
              },
              else: []
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: 1,
          employees: 1,
          totalUsers: 1,
          totalCourses: 1,
          coursesWithDetails: 1
        }
      }
    ];

    const result = await this.groupModel.aggregate(pipeline).exec();
    
    if (!result || result.length === 0) {
      throw new NotFoundException('Group not found');
    }

    return result[0];
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    // Check if name is being updated and if it conflicts with existing group
    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existingGroup = await this.groupModel.findOne({ 
        name: updateGroupDto.name,
        _id: { $ne: id }
      }).exec();
      
      if (existingGroup) {
        throw new ConflictException('Group with this name already exists');
      }
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException('Group not found');
    }

    return updatedGroup;
  }

  async remove(id: string): Promise<void> {
    // Check if group has courses assigned
    const hasCourses = await this.hasCoursesAssigned(id);
    if (hasCourses) {
      throw new ForbiddenException(
        'Cannot delete group with assigned courses. Please remove all course assignments first.'
      );
    }

    const result = await this.groupModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Group not found');
    }
  }

  /**
   * Remove a course assignment from a group
   * @param groupId - The group ID
   * @param courseId - The course ID to remove
   * @returns Updated group or throws error
   */
  async removeCourseFromGroup(groupId: string, courseId: string): Promise<any> {
    // Verify group exists
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if course is assigned to the group
    const courseIndex = group.courses.findIndex(c => c.courseId.toString() === courseId);
    if (courseIndex === -1) {
      throw new NotFoundException('Course is not assigned to this group');
    }

    // Remove the course assignment
    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      groupId,
      { $pull: { courses: { courseId: courseId } } },
      { new: true }
    ).exec();

    return {
      message: 'Course removed from group successfully',
      group: updatedGroup
    };
  }

  async getGroupStats(id: string) {
    const group = await this.groupModel.findById(id).exec();
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Get count of users assigned to this group
    const userCount = await this.userModel.countDocuments({ groupId: id }).exec();
    
    // Get count of employees assigned to this group
    const employeeCount = await this.employmentModel.countDocuments({ groupId: id, isActive: true }).exec();

    return {
      name: group.name,
      description: group.description,
      createdAt: (group as any).createdAt || new Date(),
      totalUsers: userCount,
      totalEmployees: employeeCount,
      totalMembers: userCount + employeeCount,
      // You'll need to implement completion rate logic based on your requirements
      completionRate: 0 // Placeholder value
    };
  }

  async assignCourseToGroup(groupId: string, assignCourseDto: AssignCourseDto): Promise<any> {
    // Verify group exists
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Verify course exists
    const course = await this.courseModel.findById(assignCourseDto.courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is already assigned to the group
    if (group.courses && group.courses.some(c => c.courseId.toString() === assignCourseDto.courseId)) {
      throw new ConflictException('Course is already assigned to this group');
    }

    // Prepare course assignment with due date
    const courseAssignment = {
      courseId: assignCourseDto.courseId,
      dueDate: new Date(assignCourseDto.dueDate)
    };

    // Add course to group
    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      groupId,
      { $push: { courses: courseAssignment } },
      { new: true }
    ).exec();

    // Send email notifications if requested
    if (assignCourseDto.sendEmailNotifications) {
      try {
        // Get all users in the group
        const users = await this.userModel.find({ groupId }).exec();
        
        // Get all employees in the group
        const employees = await this.employmentModel.find({ groupId }).exec();
        
        // Get existing employees (those who already have accounts)
        const employeeEmails = employees.map(emp => emp.email).filter(email => email);
        const existingEmployees = await this.employmentModel.find({ 
          email: { $in: employeeEmails, isActive: true } 
        }).exec();
        const existingEmployeeEmails = new Set(existingEmployees.map(emp => emp.email));
        
        // Prepare recipients with different link types
        const allRecipients = [];
        
        // // Add users (always get login link)
        // if (users.length > 0) {
          
        //   const usersWithEmail = users.filter(user => user.email);
        //   allRecipients.push(...usersWithEmail.map(user => ({
        //     email: user.email,
        //     fullName: user.fullName,
        //     type: 'user',
        //     linkType: 'signup',
        //     link: "http://195.35.21.108:5175/signup?email=" + user.email + "&name=" + user.fullName + "&role=" + user.userType
        //   })));
        // }
        
        // Add employees with appropriate link type
        if (employees.length > 0) {
          const employeesWithEmail = employees.filter(emp => emp.email);
          allRecipients.push(...employeesWithEmail.map(emp => {
            const isExistingEmployee = existingEmployeeEmails.has(emp.email);
            const linkType = isExistingEmployee ? 'login' : 'signup';
            
            let link;
            if (isExistingEmployee) {
              link = "http://195.35.21.108:5175/login?email=" + emp.email + "&name=" + emp.fullName + "&role=" + emp.role ;
            } else {
              // Create signup link with query parameters
              const params = new URLSearchParams({
                email: emp.email,
                name: emp.fullName,
                role: emp.role
              });
              link = `http://195.35.21.108:5175/signup?email=${emp.email}&name=${emp.fullName}&role=${emp.role}`;
            }
            
            return {
              email: emp.email,
              fullName: emp.fullName,
              type: 'employee',
              linkType,
              link
            };
          }));
        }
        
        if (allRecipients.length > 0) {
          await this.emailService.sendBulkCourseAssignmentEmails(
            allRecipients.map(recipient => ({
              email: recipient.email,
              fullName: recipient.fullName,
              linkType: recipient.linkType,
              link: recipient.link
            })),
            course.title,
            group.name,
            assignCourseDto.dueDate
          );
        }
      } catch (error) {
        // Log error but don't fail the assignment
        console.error('Failed to send email notifications:', error.message);
      }
    }

    return {
      message: 'Course assigned to group successfully',
      group: updatedGroup,
      course: {
        id: course._id,
        title: course.title,
        description: course.description
      },
      emailsSent: assignCourseDto.sendEmailNotifications ? 'Yes' : 'No'
    };
  }
} 