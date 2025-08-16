//import * as dotenv from 'dotenv';
//dotenv.config(); // Load .env before anything else

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donor } from './entities/donor.entity';
import { Donation } from './entities/donation.entity';
import { Appointment } from './entities/appointment.entity';
import { Request } from './entities/request.entity';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';
import { RequestsController } from './requests.controller';
import { JwtGuard } from './guards/jwt.guard';
//import { MailerModule } from '@nestjs-modules/mailer';
//import { MailerService } from './mailer.service';

// Debug logs to verify .env variables
console.log('SMTP_USER from env:', process.env.SMTP_USER);
console.log('SMTP_PASS from env:', process.env.SMTP_PASS);

@Module({
  imports: [
    TypeOrmModule.forFeature([Donor, Donation, Appointment, Request]),
    //   MailerModule.forRoot({
    //     transport: {
    //       host: process.env.SMTP_HOST,
    //       port: parseInt(process.env.SMTP_PORT || '587', 10),
    //       secure: false, // Gmail STARTTLS
    //       auth: {
    //         user: process.env.SMTP_USER,
    //         pass: process.env.SMTP_PASS,
    //       },
    //     },
    //     defaults: {
    //       from: `"LifeConnect" <${process.env.MAIL_FROM || process.env.SMTP_USER}}>`,
    //     },
    //   }),
  ],
  controllers: [DonorController, RequestsController],
  providers: [DonorService, JwtGuard /*MailerService*/],
  exports: [DonorService],
})
export class DonorModule {}
