import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DonorService } from './donor.service';
import { DonorRegisterDto } from './dto/donor-register.dto';
import { DonorLoginDto } from './dto/donor-login.dto';
import { DonorUpdateDto } from './dto/donor-update.dto';
import { DonorAvailabilityDto } from './dto/donor-availability.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('donors')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  // 1) POST /api/donors/register
  @Post('register')
  register(@Body() dto: DonorRegisterDto) {
    return this.donorService.register(dto);
  }

  // 2) POST /api/donors/login
  @Post('login')
  login(@Body() dto: DonorLoginDto) {
    return this.donorService.login(dto);
  }

  // 3) GET /api/donors/profile
  @UseGuards(JwtGuard)
  @Get('profile')
  profile(@Req() req: any) {
    return this.donorService.me(req.user.sub);
  }

  // 4) PATCH /api/donors/profile
  @UseGuards(JwtGuard)
  @Patch('profile')
  update(@Req() req: any, @Body() dto: DonorUpdateDto) {
    return this.donorService.updateProfile(req.user.sub, dto);
  }

  // 5) GET /api/donors/history
  @UseGuards(JwtGuard)
  @Get('history')
  history(@Req() req: any) {
    return this.donorService.history(req.user.sub);
  }

  // 6) POST /api/donors/availability
  @UseGuards(JwtGuard)
  @Post('availability')
  availability(@Req() req: any, @Body() dto: DonorAvailabilityDto) {
    return this.donorService.availability(req.user.sub, dto);
  }

  // 7) GET /api/donors/appointments
  @UseGuards(JwtGuard)
  @Get('appointments')
  appointments(@Req() req: any) {
    return this.donorService.upcomingAppointments(req.user.sub);
  }
  // 8) GET /api/donors/requests
  @UseGuards(JwtGuard)
  @Get('requests')
  listActiveRequests(@Req() req: any) {
    return this.donorService.listActiveRequests();
  }
}
