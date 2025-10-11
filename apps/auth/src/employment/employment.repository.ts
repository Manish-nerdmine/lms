import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmploymentDocument } from '@app/common/models/employment.schema';

@Injectable()
export class EmploymentRepository {
  constructor(
    @InjectModel(EmploymentDocument.name)
    private readonly employmentModel: Model<EmploymentDocument>,
  ) {}

  async createEmployment(createEmploymentDto: any, userId: Types.ObjectId): Promise<EmploymentDocument> {
    return await this.employmentModel.create({ ...createEmploymentDto, userId });
  }

  async findOneByEmail(email: string): Promise<EmploymentDocument | null> {
    return this.employmentModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<EmploymentDocument | null> {
    return this.employmentModel.findById(id).populate('userId', 'fullName email').exec();
  }

  async findAll(): Promise<EmploymentDocument[]> {
    return this.employmentModel.find().populate('userId', 'fullName email').exec();
  }

  async update(id: string, updateData: any): Promise<EmploymentDocument | null> {
    return this.employmentModel.findByIdAndUpdate(id, updateData, { new: true }).populate('userId', 'fullName email').exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.employmentModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findEmploymentWithUser(email: string): Promise<EmploymentDocument[]> {
    return this.employmentModel.aggregate([
      {
        $lookup: {
          from: 'userdocuments',
          localField: 'email',
          foreignField: 'email',
          as: 'userInfo'
        }
      },
      {
        $match: { email }
      }
    ]).exec();
  }

  async find(query: any): Promise<EmploymentDocument[]> {
    return this.employmentModel.find(query).populate('userId', 'fullName email').exec();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.employmentModel.aggregate(pipeline).exec();
  }
}
