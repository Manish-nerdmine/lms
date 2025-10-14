import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema, UserProgress, UserProgressSchema, Video, VideoSchema } from '@app/common/models/lms.schema';
import { UserDocument, UserSchema } from '@app/common/models/user.schema';
import { Group, GroupSchema } from '@app/common/models/group.schema';
import { EmploymentDocument, EmploymentSchema } from '@app/common/models/employment.schema';
import { VideosService } from '../videos/videos.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Video.name, schema: VideoSchema },
      { name: EmploymentDocument.name, schema: EmploymentSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, VideosService],
  exports: [CoursesService],
})
export class CoursesModule {} 