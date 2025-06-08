import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, UserPasscodeDocument } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class PasscodeRepository extends AbstractRepository<UserPasscodeDocument> {
  protected readonly logger = new Logger(PasscodeRepository.name);

  constructor(
    @InjectModel(UserPasscodeDocument.name)
    passcodeModel: Model<UserPasscodeDocument>,
  ) {
    super(passcodeModel);
  }

  async createPasscode(passcodeDocument: UserPasscodeDocument) {
    return await this.model.create(passcodeDocument);
  }

  async getPasscodeUser(passcodeDocument: UserPasscodeDocument) {
    return await this.model.findOne({ ...passcodeDocument }, { user: true }).populate({
      path: 'user',
      populate: [
        {
          path: 'userType',
        },
      ],
    });
  }

  async getPasscodeUserId(passcodeDocument: UserPasscodeDocument) {
    return await this.model.findOne({ ...passcodeDocument }, { user: true });
  }

  async checkPasscodeUser(passcodeDocument: UserPasscodeDocument) {
    return await this.model.findOne({ ...passcodeDocument }, {});
  }

  async deletePasscode(user: Types.ObjectId, currentPasscode: string) {
    await this.model.deleteMany({ user: user, passcode: { $ne: currentPasscode } });
  }

  async deleteAllPasscode(user: Types.ObjectId) {
    await this.model.deleteMany({ user: user });
  }
}
