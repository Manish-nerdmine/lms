import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from '@app/common/models/group.schema';
import { UserDocument, UserSchema } from '@app/common/models/user.schema';
import { EmploymentDocument, EmploymentSchema } from '@app/common/models/employment.schema';
import { Course, CourseSchema, UserProgress, UserProgressSchema } from '@app/common/models/lms.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: EmploymentDocument.name, schema: EmploymentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: UserProgress.name, schema: UserProgressSchema }
    ]),
    EmailModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {} 