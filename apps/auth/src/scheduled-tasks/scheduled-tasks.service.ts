import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmploymentService } from '../employment/employment.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly employmentService: EmploymentService) {}

  // Run every day at 9:00 AM - Send reminders to inactive accounts
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleReminderEmails() {
    this.logger.log('Starting scheduled task: Send reminder emails to inactive accounts');
    
    try {
      const result = await this.employmentService.sendReminderEmailsToInactiveAccounts();
      this.logger.log(`Reminder emails sent successfully: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder emails: ${error.message}`, error.stack);
    }
  }

  // Run every day at 10:00 AM - Send overdue course reminders
  @Cron('0 10 * * *')
  async handleOverdueReminderEmails() {
    this.logger.log('Starting scheduled task: Send overdue reminder emails to employees with incomplete courses');
    
    try {
      const result = await this.employmentService.sendOverdueReminderEmails();
      this.logger.log(`Overdue reminder emails sent successfully: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send overdue reminder emails: ${error.message}`, error.stack);
    }
  }

  // Uncomment and modify this if you want to test with a shorter interval
  // @Cron('*/5 * * * *') // Runs every 5 minutes for testing
  // async handleReminderEmailsTest() {
  //   this.logger.log('TEST: Starting scheduled task: Send reminder emails to inactive accounts');
  //   try {
  //     const result = await this.employmentService.sendReminderEmailsToInactiveAccounts();
  //     this.logger.log(`TEST: Reminder emails sent: ${JSON.stringify(result)}`);
  //   } catch (error) {
  //     this.logger.error(`TEST: Failed to send reminder emails: ${error.message}`);
  //   }
  // }
}

