import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { UserDocument, UserSchema } from '@app/common/models/user.schema';
import { EmploymentDocument, EmploymentSchema } from '@app/common/models/employment.schema';
import { Course, CourseSchema, UserProgress, UserProgressSchema } from '@app/common/models/lms.schema';
import { Group, GroupSchema } from '@app/common/models/group.schema';
import { PasscodeModule } from '../passcode/passcode.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: EmploymentDocument.name, schema: EmploymentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    PasscodeModule,
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}

