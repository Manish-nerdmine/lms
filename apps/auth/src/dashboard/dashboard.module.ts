import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Course, CourseSchema, UserProgress, UserProgressSchema, QuizAttempt, QuizAttemptSchema } from '@app/common/models/lms.schema';
import { EmploymentDocument, EmploymentSchema } from '@app/common/models/employment.schema';
import { UserDocument, UserSchema } from '@app/common/models/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: EmploymentDocument.name, schema: EmploymentSchema },
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

