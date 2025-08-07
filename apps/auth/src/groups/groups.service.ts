import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '@app/common/models/group.schema';
import { Course } from '@app/common/models/lms.schema';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    // Verify course exists
    const course = await this.courseModel.findById(createGroupDto.courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if group name already exists for this course
    const existingGroup = await this.groupModel.findOne({ 
      name: createGroupDto.name,
      courseId: createGroupDto.courseId
    }).exec();
    
    if (existingGroup) {
      throw new ConflictException('Group with this name already exists for this course');
    }

    const group = new this.groupModel({
      ...createGroupDto,
      currentParticipants: createGroupDto.userIds?.length || 0,
    });

    return group.save();
  }

  async findAll(): Promise<Group[]> {
    return this.groupModel
      .find()
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCourse(courseId: string): Promise<Group[]> {
    return this.groupModel
      .find({ courseId })
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDepartment(departmentId: string): Promise<Group[]> {
    return this.groupModel
      .find({ departmentId })
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActive(): Promise<Group[]> {
    return this.groupModel
      .find({ isActive: true })
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel
      .findById(id)
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .exec();
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async update(id: string, updateGroupDto: Partial<CreateGroupDto>): Promise<Group> {
    const group = await this.findOne(id);

    // Check if name is being updated and if it conflicts with existing group
    if (updateGroupDto.name) {
      const existingGroup = await this.groupModel.findOne({ 
        name: updateGroupDto.name,
        courseId: group.courseId,
        _id: { $ne: id }
      }).exec();
      
      if (existingGroup) {
        throw new ConflictException('Group with this name already exists for this course');
      }
    }

    // Prepare update object
    const updateData: any = { ...updateGroupDto };

    // Update current participants count if userIds is being updated
    if (updateGroupDto.userIds) {
      updateData.currentParticipants = updateGroupDto.userIds.length;
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
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

  async addUsers(groupId: string, userIds: string[]): Promise<Group> {
    const group = await this.findOne(groupId);

    // Check if adding users would exceed max participants
    if (group.maxParticipants > 0 && 
        group.currentParticipants + userIds.length > group.maxParticipants) {
      throw new BadRequestException('Adding these users would exceed maximum participants limit');
    }

    // Add new users (avoid duplicates)
    const existingUserIds = new Set(group.userIds);
    const newUserIds = userIds.filter(id => !existingUserIds.has(id));
    
    if (newUserIds.length === 0) {
      throw new BadRequestException('All users are already in the group');
    }

    const updatedUserIds = [...group.userIds, ...newUserIds];
    const updatedCurrentParticipants = updatedUserIds.length;

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(
        groupId,
        { 
          userIds: updatedUserIds,
          currentParticipants: updatedCurrentParticipants
        },
        { new: true }
      )
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .exec();

    return updatedGroup;
  }

  async removeUsers(groupId: string, userIds: string[]): Promise<Group> {
    const group = await this.findOne(groupId);

    // Remove specified users
    const updatedUserIds = group.userIds.filter(id => !userIds.includes(id));
    const updatedCurrentParticipants = updatedUserIds.length;

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(
        groupId,
        { 
          userIds: updatedUserIds,
          currentParticipants: updatedCurrentParticipants
        },
        { new: true }
      )
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .exec();

    return updatedGroup;
  }

  async updateStatus(groupId: string, status: string): Promise<Group> {
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status. Must be one of: pending, active, completed, cancelled');
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(groupId, { status }, { new: true })
      .populate('courseId', 'title description')
      .populate('departmentId', 'name')
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException('Group not found');
    }

    return updatedGroup;
  }
} 