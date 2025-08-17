import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeMailer();
  }

  private async initializeMailer() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('SMTP credentials missing — MailerService disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    if (!this.transporter) {
      this.logger.warn('Mailer not initialized — skipping email');
      return;
    }

    try {
      const html = `
        <h2>Welcome to LifeConnect!</h2>
        <p>Hello ${name || 'Donor'},</p>
        <p>Thank you for registering as a blood donor with LifeConnect. Your registration is now complete!</p>
        <p>You can now login and start helping save lives by donating blood.</p>
        <br>
        <p>Best regards,</p>
        <p>The LifeConnect Team</p>
      `;

      await this.transporter.sendMail({
        from: `"LifeConnect" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Welcome to LifeConnect - Registration Complete',
        html,
      });

      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err.stack);
    }
  }

  async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn('Mailer not initialized — skipping email');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"LifeConnect" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err.stack);
    }
  }
}
