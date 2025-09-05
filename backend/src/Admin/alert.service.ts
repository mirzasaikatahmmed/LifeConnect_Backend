import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createAlert(userId: number, alertData: Partial<Alert>): Promise<Alert> {
    // Verify user is admin
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user || user.userType !== 'admin') {
      throw new ForbiddenException('Only admins can create alerts');
    }

    const alert = this.alertRepository.create({
      ...alertData,
      userId: userId,
      createdBy: user,
    });

    return await this.alertRepository.save(alert);
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await this.alertRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await this.alertRepository.find({
      where: { status: 'active' },
      relations: ['createdBy'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async getAlertById(id: number): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async updateAlert(
    id: number,
    userId: number,
    updateData: Partial<Alert>,
  ): Promise<Alert> {
    // Verify user is admin
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.userType !== 'admin') {
      throw new ForbiddenException('Only admins can update alerts');
    }

    const alert = await this.getAlertById(id);

    Object.assign(alert, updateData);
    return await this.alertRepository.save(alert);
  }

  async deleteAlert(id: number, userId: number): Promise<void> {
    // Verify user is admin
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.userType !== 'admin') {
      throw new ForbiddenException('Only admins can delete alerts');
    }

    const alert = await this.getAlertById(id);
    await this.alertRepository.remove(alert);
  }

  async getAlertsByCreator(creatorId: number): Promise<Alert[]> {
    return await this.alertRepository.find({
      where: { userId: creatorId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAlertsByAudience(audience: string): Promise<Alert[]> {
    return await this.alertRepository.find({
      where: [
        { targetAudience: audience, status: 'active' },
        { targetAudience: 'all', status: 'active' },
        { isSystemWide: true, status: 'active' },
      ],
      relations: ['createdBy'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async archiveExpiredAlerts(): Promise<number> {
    const expiredAlerts = await this.alertRepository.find({
      where: {
        status: 'active',
        expiresAt: new Date(),
      },
    });

    if (expiredAlerts.length === 0) {
      return 0;
    }

    await this.alertRepository.update(
      { id: expiredAlerts.map((alert) => alert.id) as any },
      { status: 'expired' },
    );

    return expiredAlerts.length;
  }
}
