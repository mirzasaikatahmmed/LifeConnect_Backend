import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Alert } from './entities/alert.entity';
import { AdminGuard } from './guards/admin.guard';
import { JwtGuard } from './guards/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, User, Role, Alert]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lifeconnect-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard, JwtGuard],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule {}
