import { Controller, Get, UseGuards } from '@nestjs/common';
import { DonorService } from './donor.service';
import { JwtGuard } from './guards/jwt.guard';

@Controller('requests')
export class RequestsController {
    constructor(private readonly donorService: DonorService) { }

    // 8) GET /api/requests (for donors to view active requests)
    @UseGuards(JwtGuard)
    @Get()
    listActive() {
        return this.donorService.listActiveRequests();
    }
}
