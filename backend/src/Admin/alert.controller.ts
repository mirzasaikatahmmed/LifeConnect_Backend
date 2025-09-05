import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { AdminGuard } from './guards/admin.guard';
import {
  CreateAlertDto,
  UpdateAlertDto,
  AlertResponseDto,
} from './dto/alert.dto';

@Controller('api/alerts')
@UseGuards(AdminGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  async createAlert(
    @Req() req: any,
    @Body() createAlertDto: CreateAlertDto,
  ): Promise<AlertResponseDto> {
    const alert = await this.alertService.createAlert(
      req.user.sub,
      createAlertDto,
    );
    return this.formatAlertResponse(alert);
  }

  @Get()
  async getAllAlerts(
    @Query('status') status?: string,
  ): Promise<AlertResponseDto[]> {
    let alerts;
    if (status === 'active') {
      alerts = await this.alertService.getActiveAlerts();
    } else {
      alerts = await this.alertService.getAllAlerts();
    }
    return alerts.map((alert) => this.formatAlertResponse(alert));
  }

  @Get('by-audience/:audience')
  async getAlertsByAudience(
    @Param('audience') audience: string,
  ): Promise<AlertResponseDto[]> {
    const alerts = await this.alertService.getAlertsByAudience(audience);
    return alerts.map((alert) => this.formatAlertResponse(alert));
  }

  @Get('my-alerts')
  async getMyAlerts(@Req() req: any): Promise<AlertResponseDto[]> {
    const alerts = await this.alertService.getAlertsByCreator(req.user.sub);
    return alerts.map((alert) => this.formatAlertResponse(alert));
  }

  @Get(':id')
  async getAlertById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AlertResponseDto> {
    const alert = await this.alertService.getAlertById(id);
    return this.formatAlertResponse(alert);
  }

  @Put(':id')
  async updateAlert(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateAlertDto: UpdateAlertDto,
  ): Promise<AlertResponseDto> {
    const alert = await this.alertService.updateAlert(
      id,
      req.user.sub,
      updateAlertDto,
    );
    return this.formatAlertResponse(alert);
  }

  @Delete(':id')
  async deleteAlert(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ message: string }> {
    await this.alertService.deleteAlert(id, req.user.sub);
    return { message: 'Alert deleted successfully' };
  }

  @Post('archive-expired')
  async archiveExpiredAlerts(): Promise<{
    message: string;
    archivedCount: number;
  }> {
    const archivedCount = await this.alertService.archiveExpiredAlerts();
    return {
      message: 'Expired alerts archived successfully',
      archivedCount,
    };
  }

  private formatAlertResponse(alert: any): AlertResponseDto {
    return {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      type: alert.type,
      status: alert.status,
      expiresAt: alert.expiresAt,
      isSystemWide: alert.isSystemWide,
      targetAudience: alert.targetAudience,
      priority: alert.priority,
      userId: alert.userId,
      createdBy: alert.createdBy
        ? {
            id: alert.createdBy.id,
            name: alert.createdBy.name,
            email: alert.createdBy.email,
          }
        : undefined,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };
  }
}
