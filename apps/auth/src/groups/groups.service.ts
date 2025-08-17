import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '@app/common/models/group.schema';
import { UserDocument } from '@app/common/models/user.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
  ) {}

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

  async findAll(): Promise<Group[]> {
    return this.groupModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllWithStats(page: number = 1, limit: number = 10) {
    // Ensure page and limit are valid numbers
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, parseInt(String(limit)) || 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Use aggregation to get groups with user counts
    const pipeline = [
      {
        $lookup: {
          from: 'userdocuments', // MongoDB collection name for User
          localField: '_id',
          foreignField: 'groupId',
          as: 'users'
        }
      },
      {
        $addFields: {
          totalUsers: { $size: '$users' }
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
    const group = await this.groupModel.findById(id).exec();
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
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
    const result = await this.groupModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Group not found');
    }
  }

  async getGroupStats(id: string) {
    const group = await this.groupModel.findById(id).exec();
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Get count of users assigned to this group
    const userCount = await this.userModel.countDocuments({ groupId: id }).exec();

    return {
      name: group.name,
      description: group.description,
      createdAt: (group as any).createdAt || new Date(),
      totalUsers: userCount,
      // You'll need to implement completion rate logic based on your requirements
      completionRate: 0 // Placeholder value
    };
  }
} 