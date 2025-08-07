import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from '@app/common/models/group.schema';
import { Course, CourseSchema } from '@app/common/models/lms.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Course.name, schema: CourseSchema }
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {} 