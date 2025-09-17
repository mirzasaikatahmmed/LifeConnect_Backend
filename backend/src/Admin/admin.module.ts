import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { MailerService } from './mailer.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Alert } from './entities/alert.entity';
import { UserActivity } from './entities/user-activity.entity';
import { BloodRequest } from '../Manager/Entities/bloodrequest.entity';
import { BloodDonationHistory } from '../Donor/entities/blooddonationhistory.entity';
import { AdminGuard } from './guards/admin.guard';
import { JwtGuard } from './guards/jwt.guard';
import { PusherModule } from '../pusher/pusher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Alert, UserActivity, BloodRequest, BloodDonationHistory]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lifeconnect-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    PusherModule,
  ],
  controllers: [AdminController, AlertController],
  providers: [AdminService, AlertService, MailerService, AdminGuard, JwtGuard],
  exports: [AdminService, MailerService, TypeOrmModule],
})
export class AdminModule {}
