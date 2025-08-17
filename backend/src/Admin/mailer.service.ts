import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Alert } from './entities/alert.entity';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.initializeMailer();
  }

  private async initializeMailer() {
    this.logger.log(
      `SMTP Configuration - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}, User: ${process.env.SMTP_USER ? 'SET' : 'NOT SET'}, Password: ${process.env.SMTP_PASSWORD ? 'SET' : 'NOT SET'}`,
    );

    // Configure SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Test connection without blocking startup
    try {
      await this.transporter.verify();
      this.logger.log('SMTP transporter ready');
    } catch (error) {
      this.logger.error('Transporter is ready error', error.message);
      this.logger.warn(
        'Email functionality may be limited until SMTP is configured correctly',
      );
    }
  }

  async sendAlertToAllUsers(alert: Alert): Promise<{
    success: boolean;
    message: string;
    sentCount?: number;
    failedCount?: number;
  }> {
    try {
      // Get all active users with email addresses
      const users = await this.userRepository.find({
        where: { isActive: true },
        select: ['id', 'email', 'name', 'userType'],
      });

      if (users.length === 0) {
        return {
          success: false,
          message: 'No active users found to send alerts to',
        };
      }

      // Filter users based on target audience if specified
      let targetUsers = users;
      if (alert.targetAudience && alert.targetAudience !== 'all') {
        targetUsers = users.filter(
          (user) => user.userType === alert.targetAudience,
        );
      }

      if (targetUsers.length === 0) {
        return {
          success: false,
          message: `No users found for target audience: ${alert.targetAudience}`,
        };
      }

      // Send emails to all target users
      const emailPromises = targetUsers.map((user) =>
        this.sendEmailToUser(user.email, user.name, alert),
      );

      const results = await Promise.allSettled(emailPromises);

      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failedCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      this.logger.log(
        `Alert email sent: ${successCount} successful, ${failedCount} failed`,
      );

      return {
        success: successCount > 0,
        message: `Alert sent to ${successCount} users. ${failedCount} failed.`,
        sentCount: successCount,
        failedCount: failedCount,
      };
    } catch (error) {
      this.logger.error('Error sending alert emails:', error);
      return {
        success: false,
        message: 'Failed to send alert emails',
      };
    }
  }

  private async sendEmailToUser(
    email: string,
    userName: string,
    alert: Alert,
  ): Promise<void> {
    try {
      const alertTypeColor = {
        info: '#17a2b8',
        warning: '#ffc107',
        error: '#dc3545',
        success: '#28a745',
      };

      const priorityText = {
        0: 'Low',
        1: 'Medium',
        2: 'High',
        3: 'Critical',
      };

      const mailOptions = {
        from: `"LifeConnect Alert System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[${alert.type.toUpperCase()}] ${alert.title}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LifeConnect Alert</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; }
              .alert-type { 
                display: inline-block; 
                padding: 5px 10px; 
                border-radius: 4px; 
                color: white; 
                background: ${alertTypeColor[alert.type] || '#6c757d'}; 
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
              }
              .priority { color: #666; font-size: 14px; margin-top: 10px; }
              .message { background: white; padding: 15px; border-left: 4px solid ${alertTypeColor[alert.type] || '#6c757d'}; margin: 15px 0; }
              .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
              .timestamp { color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🩸 LifeConnect Alert System</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Important System Notification</p>
              </div>
              <div class="content">
                <p>Dear ${userName},</p>
                
                <div style="margin: 15px 0;">
                  <span class="alert-type">${alert.type}</span>
                  <div class="priority">Priority: <strong>${priorityText[alert.priority] || 'Normal'}</strong></div>
                </div>
                
                <h3 style="color: #333; margin-top: 20px;">${alert.title}</h3>
                
                <div class="message">
                  ${alert.message.replace(/\n/g, '<br>')}
                </div>
                
                ${alert.expiresAt ? `<p><strong>⏰ Expires:</strong> ${new Date(alert.expiresAt).toLocaleString()}</p>` : ''}
                
                <div class="timestamp">
                  <p><strong>📅 Sent:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 14px; color: #666;">
                  This is an automated message from the LifeConnect system. 
                  Please do not reply to this email.
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0;">© 2025 LifeConnect - Connecting Lives, Saving Lives</p>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">Blood Donation Management System</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Alert email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection failed:', error);
      return false;
    }
  }

  async createTestUser(email: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        this.logger.log(`Test user ${email} already exists`);
        return existingUser;
      }

      // Create test user
      const testUser = this.userRepository.create({
        email: email,
        name: 'Test User',
        password: 'test123',
        phoneNumber: '+1234567890',
        bloodType: 'O+',
        userType: 'donor',
        roleId: 1,
        isActive: true,
        isVerified: true,
      });

      const savedUser = await this.userRepository.save(testUser);
      this.logger.log(`Test user created successfully: ${email}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create test user ${email}:`, error);
      throw error;
    }
  }

  async sendTestEmail(
    email: string,
    userName: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const mailOptions = {
        from: `"LifeConnect Test System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🩸 LifeConnect - SMTP Test Email',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LifeConnect SMTP Test</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; }
              .success-badge { 
                display: inline-block; 
                padding: 8px 15px; 
                border-radius: 20px; 
                color: white; 
                background: #28a745; 
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
              }
              .test-info { background: white; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
              .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
              .timestamp { color: #666; font-size: 12px; }
              .check-icon { font-size: 24px; color: #28a745; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🩸 LifeConnect SMTP Test</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Email Configuration Test</p>
              </div>
              <div class="content">
                <div style="text-align: center; margin: 20px 0;">
                  <span class="check-icon">✅</span>
                  <span class="success-badge">SMTP CONNECTION SUCCESS</span>
                </div>
                
                <p>Dear ${userName},</p>
                
                <div class="test-info">
                  <h3 style="color: #333; margin-top: 0;">🎉 Email System Test Successful!</h3>
                  <p><strong>✅ SMTP Configuration:</strong> Working correctly</p>
                  <p><strong>✅ Email Delivery:</strong> Functional</p>
                  <p><strong>✅ HTML Templates:</strong> Rendering properly</p>
                  <p><strong>✅ Authentication:</strong> Verified</p>
                </div>
                
                <h4>📋 Test Details:</h4>
                <ul>
                  <li><strong>SMTP Server:</strong> ${process.env.SMTP_HOST}</li>
                  <li><strong>Port:</strong> ${process.env.SMTP_PORT || '587'}</li>
                  <li><strong>Authentication:</strong> Enabled</li>
                  <li><strong>TLS:</strong> Enabled</li>
                  <li><strong>Test User Email:</strong> ${email}</li>
                </ul>
                
                <div class="timestamp" style="margin-top: 20px;">
                  <p><strong>🕒 Test Completed:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 14px; color: #666;">
                  This is a test message from the LifeConnect email system. 
                  Your SMTP configuration is working correctly!
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0;">© 2025 LifeConnect - Connecting Lives, Saving Lives</p>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">Blood Donation Management System</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Test email sent successfully to ${email}`);
      return {
        success: true,
        message: `Test email sent successfully to ${email}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send test email to ${email}:`, error);
      return {
        success: false,
        message: `Failed to send test email: ${error.message}`,
      };
    }
  }
}
