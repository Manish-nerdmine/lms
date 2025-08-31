import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmploymentController } from './employment.controller';
import { EmploymentService } from './employment.service';
import { EmploymentRepository } from './employment.repository';
import { EmploymentDocument, EmploymentSchema } from '@app/common/models/employment.schema';
import { Group, GroupSchema } from '@app/common/models/group.schema';
import { Department, DepartmentSchema } from '@app/common/models/department.schema';
import { UserDocument, UserSchema } from '@app/common/models/user.schema';
import { PasscodeModule } from '../passcode/passcode.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmploymentDocument.name, schema: EmploymentSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: UserDocument.name, schema: UserSchema },
    ]),
    PasscodeModule,
  ],
  controllers: [EmploymentController],
  providers: [EmploymentService, EmploymentRepository],
  exports: [EmploymentService, EmploymentRepository],
})
export class EmploymentModule {}
