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
            <a href="${link}" style="background-color: #2196F3; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4); border: none;">
              <span style="color:green;">Sign Up & Start Learning</span>
            </a>
          </div>
        ` : ''}

        <div style="background-color:rgb(248, 250, 248); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
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
            <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 25px; background-color: #4CAF50; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
                  <a href="${link}" target="_blank" style="border: none; border-radius: 25px; padding: 15px 40px; font-size: 16px; font-weight: bold; color: #ffffff !important; text-decoration: none; display: inline-block; mso-padding-alt: 0; background-color: #4CAF50;">
                    <span style="color:rgba(255, 255, 255, 0.34) !important; text-decoration: none; font-weight: bold;">
                      ${link.includes('signup') ? '🚀 Sign Up & Start Learning' : '📚 Go to My Courses'}
                    </span>
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 10px 0;">
            <p style="color: #666; font-size: 12px;">
              Or copy this link: <a href="${link}" style="color: #4CAF50; word-break: break-all;">${link}</a>
            </p>
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

  async send7DayReminderEmail(
    userEmail: string,
    userName: string,
    courseTitle: string,
    signupLink?: string,
  ): Promise<void> {
    try {
      const subject = `👋 ${userName}, don't miss your "${courseTitle}" training — activate your ClickShield account today`;
      const html = this.get7DayReminderTemplate(userName, courseTitle, signupLink);
      
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`7-day reminder email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send 7-day reminder email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send 7-day reminder email: ${error.message}`);
    }
  }

  async send15DayReminderEmail(
    userEmail: string,
    userName: string,
    courseTitle: string,
    signupLink?: string,
  ): Promise<void> {
    try {
      const subject = `⚠️ ${userName}, your "${courseTitle}" training is pending — please create your ClickShield account now`;
      const html = this.get15DayReminderTemplate(userName, courseTitle, signupLink);
      
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`15-day reminder email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send 15-day reminder email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send 15-day reminder email: ${error.message}`);
    }
  }

  private get7DayReminderTemplate(
    userName: string,
    courseTitle: string,
    signupLink?: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">👋 Don't Miss Your Training</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Activate Your Account Today</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We noticed that you haven't yet created your ClickShield account to access your assigned course "<strong>${courseTitle}</strong>".
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Setting up your account only takes a few minutes — once done, you can start your training right away.
          </p>
        </div>

        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="color: #1976d2; margin-top: 0;">Here's how to get started:</h3>
          <ol style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Click the button below to sign up on ClickShield.</li>
            <li>Log in using your work email.</li>
            <li>Access your assigned course and begin learning.</li>
          </ol>
        </div>

        ${signupLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupLink}" style="background-color: #2196F3; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4); border: none;">
              Create My Account
            </a>
          </div>
        ` : ''}

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
            Completing this step ensures you don't miss important training and stay aligned with your team's learning plan.
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0;">
            If you face any issues signing up, please contact your administrator or ClickShield support.
          </p>
          <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
            Best regards,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Course: ${courseTitle}
          </p>
        </div>
      </div>
    `;
  }

  private get15DayReminderTemplate(
    userName: string,
    courseTitle: string,
    signupLink?: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Action Required</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Training is Pending</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            It's been 15 days since your training "<strong>${courseTitle}</strong>" was assigned on ClickShield, and we noticed that your account has not yet been created.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6; font-weight: 600;">
            This training is mandatory and important for your learning progress. Please complete your account setup immediately to access your course and avoid delays.
          </p>
        </div>

        <div style="background-color: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
          <h3 style="color: #c92a2a; margin-top: 0;">Next Steps:</h3>
          <ol style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Click the button below to create your ClickShield account.</li>
            <li>Log in to view your assigned course.</li>
            <li>Begin and complete your training.</li>
          </ol>
        </div>

        ${signupLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupLink}" style="background-color: #ff6b6b; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); border: none;">
              Activate My Account
            </a>
          </div>
        ` : ''}

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6; font-weight: 600;">
            We encourage you to finish this step today to stay compliant with your training requirements.
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Best regards,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Course: ${courseTitle}
          </p>
        </div>
      </div>
    `;
  }

  async send7DayOverdueReminderEmail(
    userEmail: string,
    userName: string,
    courseTitle: string,
    dueDate: Date,
    loginLink?: string,
  ): Promise<void> {
    try {
      const subject = `👉 ${userName}, your "${courseTitle}" training on ClickShield is 7 days overdue`;
      const html = this.get7DayOverdueReminderTemplate(userName, courseTitle, dueDate, loginLink);
      
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`7-day overdue reminder email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send 7-day overdue reminder email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send 7-day overdue reminder email: ${error.message}`);
    }
  }

  async send15DayOverdueReminderEmail(
    userEmail: string,
    userName: string,
    courseTitle: string,
    dueDate: Date,
    loginLink?: string,
  ): Promise<void> {
    try {
      const subject = `⏰ ${userName}, your "${courseTitle}" training is pending for 15 days — please complete it soon`;
      const html = this.get15DayOverdueReminderTemplate(userName, courseTitle, dueDate, loginLink);
      
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`15-day overdue reminder email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send 15-day overdue reminder email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send 15-day overdue reminder email: ${error.message}`);
    }
  }

  async send24HourFinalReminderEmail(
    userEmail: string,
    userName: string,
    courseTitle: string,
    finalDeadline: Date,
    loginLink?: string,
  ): Promise<void> {
    try {
      const subject = `🚨 Final Reminder: ${userName}, complete "${courseTitle}" training within 24 hours`;
      const html = this.get24HourFinalReminderTemplate(userName, courseTitle, finalDeadline, loginLink);
      
      const mailOptions = {
        from: 'instatimu@gmail.com',
        to: userEmail,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`24-hour final reminder email sent successfully to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send 24-hour final reminder email to ${userEmail}: ${error.message}`);
      throw new Error(`Failed to send 24-hour final reminder email: ${error.message}`);
    }
  }

  private get7DayOverdueReminderTemplate(
    userName: string,
    courseTitle: string,
    dueDate: Date,
    loginLink?: string,
  ): string {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">👉 Course Overdue</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">7 Days Past Due</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We noticed that your assigned training "<strong>${courseTitle}</strong>" on ClickShield is still incomplete and has been overdue for 7 days.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Completing this course will help you stay updated and maintain compliance within your learning plan.
          </p>
        </div>

        <div style="background-color: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
          <h3 style="color: #c92a2a; margin-top: 0;">Course Details:</h3>
          <div style="color: #555; line-height: 1.8;">
            <p style="margin: 5px 0;"><strong>Course Name:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Original Due Date:</strong> ${dueDateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Overdue by 7 Days</p>
          </div>
        </div>

        ${loginLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #ff6b6b; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); border: none;">
              Complete Training Now
            </a>
          </div>
        ` : ''}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Thank you for your dedication to continuous learning.
          </p>
          <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
            Best regards,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>
      </div>
    `;
  }

  private get15DayOverdueReminderTemplate(
    userName: string,
    courseTitle: string,
    dueDate: Date,
    loginLink?: string,
  ): string {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Action Required</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">15 Days Overdue</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Your assigned course "<strong>${courseTitle}</strong>" on ClickShield has been overdue for 15 days. 
            This training is essential to ensure compliance and continued skill growth in your role.
          </p>
        </div>

        <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <h3 style="color: #f57c00; margin-top: 0;">Course Details:</h3>
          <div style="color: #555; line-height: 1.8;">
            <p style="margin: 5px 0;"><strong>Course Name:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Original Due Date:</strong> ${dueDateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Overdue by 15 Days</p>
          </div>
        </div>

        ${loginLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #ff9800; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4); border: none;">
              Go to My Courses
            </a>
          </div>
        ` : ''}

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
            Please make this a priority and complete your course as soon as possible.
          </p>
          <p style="color: #555; margin: 10px 0 0 0; font-size: 14px; line-height: 1.6;">
            If you're facing any technical issues, feel free to contact your administrator or the ClickShield support team.
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Best regards,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>
      </div>
    `;
  }

  private get24HourFinalReminderTemplate(
    userName: string,
    courseTitle: string,
    finalDeadline: Date,
    loginLink?: string,
  ): string {
    const deadlineFormatted = new Date(finalDeadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #c92a2a 0%, #a61e1e 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚨 FINAL REMINDER</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">24 Hours Remaining</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0; border: 2px solid #c92a2a;">
          <h2 style="color: #c92a2a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6; font-weight: 600;">
            This is your final reminder to complete your overdue training "<strong>${courseTitle}</strong>" on ClickShield. 
            The final deadline is in 24 hours.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Please log in immediately and finish your course to maintain your compliance record and stay up to date with your training plan.
          </p>
        </div>

        <div style="background-color: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c92a2a;">
          <h3 style="color: #c92a2a; margin-top: 0;">Course Details:</h3>
          <div style="color: #555; line-height: 1.8;">
            <p style="margin: 5px 0;"><strong>Course Name:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Final Deadline:</strong> ${deadlineFormatted}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Overdue – Final Reminder</p>
          </div>
        </div>

        ${loginLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #c92a2a; background: linear-gradient(135deg, #c92a2a 0%, #a61e1e 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(201, 42, 42, 0.4); border: none;">
              Complete Training Now
            </a>
          </div>
        ` : ''}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #c92a2a;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Thank you for acting promptly on this.
          </p>
          <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
            Best regards,<br>
            <strong style="color: #333;">The ClickShield Team</strong>
          </p>
        </div>
      </div>
    `;
  }
}
