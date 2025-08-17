import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Param,
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

  // 8) GET /api/donors/requests
  @UseGuards(JwtGuard)
  @Get('requests')
  listActiveRequests(@Req() req: any) {
    return this.donorService.listActiveRequests();
  }

  // History Routes
  // 9) POST /api/donors/history
  @UseGuards(JwtGuard)
  @Post('history')
  createHistory(@Req() req: any, @Body() historyData: any) {
    return this.donorService.createHistory(req.user.sub, historyData);
  }

  // 10) GET /api/donors/history/:id
  @UseGuards(JwtGuard)
  @Get('history/:id')
  getHistoryById(@Req() req: any, @Param('id') id: number) {
    return this.donorService.getHistoryById(req.user.sub, id);
  }

  // 11) PUT /api/donors/history/:id
  @UseGuards(JwtGuard)
  @Put('history/:id')
  updateHistory(@Req() req: any, @Param('id') id: number, @Body() historyData: any) {
    return this.donorService.updateHistory(req.user.sub, id, historyData);
  }

  // 12) PATCH /api/donors/history/:id
  @UseGuards(JwtGuard)
  @Patch('history/:id')
  patchHistory(@Req() req: any, @Param('id') id: number, @Body() historyData: any) {
    return this.donorService.patchHistory(req.user.sub, id, historyData);
  }

  // 13) DELETE /api/donors/history/:id
  @UseGuards(JwtGuard)
  @Delete('history/:id')
  deleteHistory(@Req() req: any, @Param('id') id: number) {
    return this.donorService.deleteHistory(req.user.sub, id);
  }
}
