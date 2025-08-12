import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Alert } from './entities/alert.entity';
import { Admin } from './entities/admin.entity';
import { CreateAlertDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // Get all users (Donors and Managers)
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' }
    });
  }

  // Find user by ID
  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['role']
    });
  }

  // Delete a user account
  async deleteUser(id: number): Promise<{ message: string }> {
    await this.userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  // Get all available roles
  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  // Update user's role
  async updateUserRole(userId: number, roleId: number): Promise<User | null> {
    await this.userRepository.update(userId, { roleId });
    return await this.findUserById(userId);
  }

  // Generate donation statistics report
  async getDonationReports(): Promise<any> {
    // This would typically involve complex queries to get donation statistics
    // For now, returning a basic structure that would be populated with actual data
    const totalUsers = await this.userRepository.count({ where: { userType: 'donor' } });
    const activeUsers = await this.userRepository.count({ 
      where: { userType: 'donor', isActive: true } 
    });
    
    return {
      totalDonors: totalUsers,
      activeDonors: activeUsers,
      inactiveDonors: totalUsers - activeUsers,
      // Additional statistics would be calculated here
      bloodTypeDistribution: {},
      monthlyDonations: [],
      generatedAt: new Date()
    };
  }

  // Generate blood request statistics report
  async getRequestReports(): Promise<any> {
    // This would typically involve queries to the requests table
    // For now, returning a basic structure
    const totalManagers = await this.userRepository.count({ where: { userType: 'manager' } });
    
    return {
      totalManagers: totalManagers,
      // Additional request statistics would be calculated here
      pendingRequests: 0,
      fulfilledRequests: 0,
      monthlyRequests: [],
      generatedAt: new Date()
    };
  }

  // Create a new system-wide alert
  async createAlert(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(createAlertDto);
    return await this.alertRepository.save(alert);
  }

  // Find alert by ID
  async findAlertById(id: number): Promise<Alert | null> {
    return await this.alertRepository.findOne({ where: { id } });
  }

  // Delete a system-wide alert
  async deleteAlert(id: number): Promise<{ message: string }> {
    await this.alertRepository.delete(id);
    return { message: 'Alert deleted successfully' };
  }

  // Get all active alerts
  async getActiveAlerts(): Promise<Alert[]> {
    return await this.alertRepository.find({
      where: { status: 'active' },
      order: { priority: 'DESC', createdAt: 'DESC' }
    });
  }
}
