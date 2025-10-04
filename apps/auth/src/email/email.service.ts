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
    linkType?: string,
    link?: string,
    dueDate?: string,
  ): Promise<void> {
    try {
      let subject: string;
      let html: string;

      if (linkType === 'signup') {
        // First-time course assignment (sign-up email)
        subject = 'Welcome to ClickShield – Your First Training Awaits 🚀';
        html = this.getFirstTimeAssignmentTemplate(userName, courseTitle, groupName, link);
      } else {
        // Subsequent training assignment
        subject = 'New Training Assigned on ClickShield 🎯';
        html = this.getSubsequentAssignmentTemplate(userName, courseTitle, groupName, link, dueDate);
      }
      
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Course assignment email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send course assignment email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private getFirstTimeAssignmentTemplate(
    userName: string,
    courseTitle: string,
    groupName: string,
    link?: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ClickShield</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Learning Journey Starts Here</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your manager has assigned you a training course on ClickShield – our learning platform. 
            To access your course and begin your learning journey, please sign up on ClickShield.
          </p>
        </div>

        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="color: #1976d2; margin-top: 0;">👉 What you need to do:</h3>
          <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Sign up using your work email</li>
            <li>Access your dashboard</li>
            <li>Start your assigned course</li>
          </ul>
          <p style="color: #555; margin: 15px 0 0 0; font-weight: 500;">
            This is your first step toward completing your training successfully.
          </p>
        </div>

        ${link ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Sign Up & Start Learning
            </a>
          </div>
        ` : ''}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Best,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Course: ${courseTitle} | Group: ${groupName}
          </p>
        </div>
      </div>
    `;
  }

  private getSubsequentAssignmentTemplate(
    userName: string,
    courseTitle: string,
    groupName: string,
    link?: string,
    dueDate?: string,
  ): string {
    const dueDateText = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'TBD';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Training Assigned</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Keep Enhancing Your Skills</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            A new training has been assigned to you on ClickShield. Please log in to your account and complete it by <strong>${dueDateText}</strong>.
          </p>
        </div>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3 style="color: #2e7d32; margin-top: 0;">👉 Course Details:</h3>
          <div style="color: #555; line-height: 1.8;">
            <p style="margin: 5px 0;"><strong>Course Name:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Completion Deadline:</strong> ${dueDateText}</p>
          </div>
          <p style="color: #555; margin: 15px 0 0 0; font-weight: 500;">
            Stay on track and keep enhancing your skills with ClickShield.
          </p>
        </div>

        ${link ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);">
              Go to My Courses
            </a>
          </div>
        ` : ''}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Best,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Course: ${courseTitle} | Group: ${groupName}
          </p>
        </div>
      </div>
    `;
  }

  async sendBulkCourseAssignmentEmails(
    users: Array<{ email: string; fullName: string; linkType?: string; link?: string }>,
    courseTitle: string,
    groupName: string,
    dueDate?: string,
  ): Promise<void> {
    const emailPromises = users.map(user =>
      this.sendCourseAssignmentEmail(
        user.email, 
        user.fullName, 
        courseTitle, 
        groupName, 
        user.linkType, 
        user.link,
        dueDate
      )
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
