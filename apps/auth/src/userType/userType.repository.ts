import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserTypeDocument, UserModel } from '@app/common'

@Injectable()
export class UserTypeRepository {
  constructor(@InjectModel(UserTypeDocument.name) private userTypeModel: UserModel) {}

  async findAllActive(): Promise<UserTypeDocument[]> {
    return await this.userTypeModel.find();
  }
}
