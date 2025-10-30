import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { EmploymentModule } from '../employment/employment.module';

@Module({
  imports: [EmploymentModule],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}

