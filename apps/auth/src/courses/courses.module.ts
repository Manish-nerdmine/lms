import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema, UserProgress, UserProgressSchema } from '@app/common/models/lms.schema';
import { UserDocument, UserSchema } from '@app/common/models/user.schema';
import { Group, GroupSchema } from '@app/common/models/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {} 