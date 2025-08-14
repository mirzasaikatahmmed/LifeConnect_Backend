import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'you@example.com',
            pass: process.env.SMTP_PASS || 'password',
        },
    });

    async send(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM || '"LifeConnect" <no-reply@lifeconnect.com>',
                to,
                subject,
                html,
            });
        } catch (e) {
            Logger.error('Mailer error', e);
        }
    }
}
