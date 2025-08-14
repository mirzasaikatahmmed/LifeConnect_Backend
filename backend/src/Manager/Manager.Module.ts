import { Module } from '@nestjs/common';
import { ManagerController } from './Manager.Controller';
import { ManagerService } from './Manager.Service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerEntity } from './Entities/Manager.entity';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import * as dotenv from 'dotenv';
dotenv.config()

@Module({
  imports: [TypeOrmModule.forFeature([ManagerEntity, User, Role]),
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'lifeconnect-secret-key',
    signOptions: { expiresIn: '1h' },
  }), MailerModule.forRoot({
    transport: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      //service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  }),],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule { }

