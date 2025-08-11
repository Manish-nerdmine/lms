import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '@app/common/models/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
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
} 