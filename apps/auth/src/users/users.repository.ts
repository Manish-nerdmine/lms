import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, UserDocument } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { hashPassword, comparePassword } from '../utils';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(@InjectModel(UserDocument.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async createUser(createUserDto: CreateUserDto){
    const userData: any = {
      ...createUserDto,
      // password: await hashPassword(createUserDto.password)
    };
    
    // Convert groupId string to ObjectId if provided
    if (createUserDto.groupId) {
      userData.groupId = new Types.ObjectId(createUserDto.groupId);
    }
    
    return await this.create(userData);
  }

  async find(query: any, projection?: any, options?: any) {
    return this.model.find(query, projection, options).exec();
  }

  async countDocuments(query: any) {
    return this.model.countDocuments(query).exec();
  }

  async findById(id: string) {
    return this.model.findById(id).exec();
  }

  async findByIdAndUpdate(id: string, update: any, options?: any) {
    // Convert groupId string to ObjectId if provided
    if (update.groupId) {
      update.groupId = new Types.ObjectId(update.groupId);
    }
    
    return this.model.findByIdAndUpdate(id, update, options).exec();
  }

  async findByIdAndDelete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async aggregate(pipeline: any[]) {
    return this.model.aggregate(pipeline).exec();
  }
}
