import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com" ,// e.g., "smtp.gmail.com"
        port: 587,  // e.g., 587
        secure: false, // Set to true for port 465 (SSL)
        auth: {
          user: "instatimu@gmail.com ", // SMTP Username
          pass: "ijgxbidvoajosmgy", // SMTP Password
        },
      });
  }

  async sendCourseAssignmentEmail(
    userEmail: string,
    userName: string,
    courseTitle: string,
    groupName: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: `New Course Assigned: ${courseTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${userName}!</h2>
            <p>A new course has been assigned to your group <strong>${groupName}</strong>.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Course Details:</h3>
              <p><strong>Course Title:</strong> ${courseTitle}</p>
              <p><strong>Group:</strong> ${groupName}</p>
            </div>
            <p>Please log in to your LMS account to access the course content.</p>
            <p>Best regards,<br>LMS Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Course assignment email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send course assignment email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendBulkCourseAssignmentEmails(
    users: Array<{ email: string; fullName: string }>,
    courseTitle: string,
    groupName: string,
  ): Promise<void> {
    const emailPromises = users.map(user =>
      this.sendCourseAssignmentEmail(user.email, user.fullName, courseTitle, groupName)
    );

    try {
      await Promise.all(emailPromises);
      this.logger.log(`Bulk course assignment emails sent successfully to ${users.length} users`);
    } catch (error) {
      this.logger.error(`Failed to send bulk course assignment emails: ${error.message}`);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }
  }
}
