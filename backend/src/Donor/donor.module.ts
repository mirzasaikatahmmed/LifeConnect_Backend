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
import { MailerService } from './mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donor, Donation, Appointment, Request])],
  controllers: [DonorController, RequestsController],
  providers: [DonorService, JwtGuard, MailerService],
  exports: [DonorService],
})
export class DonorModule {}
