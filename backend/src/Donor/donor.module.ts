//import * as dotenv from 'dotenv';
//dotenv.config(); // Load .env before anything else

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../Admin/entities/user.entity';
import { BloodDonationHistory } from './entities/blooddonationhistory.entity';
import { BloodRequest } from '../Manager/Entities/bloodrequest.entity';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';
import { JwtGuard } from './guards/jwt.guard';
import { MailerService } from './mailer.service';


// Debug logs to verify .env variables
console.log('SMTP_USER from env:', process.env.SMTP_USER);
console.log('SMTP_PASS from env:', process.env.SMTP_PASS);

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BloodDonationHistory, BloodRequest]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lifeconnect-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [DonorController],
  providers: [DonorService, JwtGuard, MailerService],
  exports: [DonorService],
})
export class DonorModule { }