import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto, SendAlertEmailDto, CreateUserDto, LoginDto, CreateRoleDto } from './admin.dto';
import { MailerService } from './mailer.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private mailerService: MailerService,
    private jwtService: JwtService,
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

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role']
    });
  }

  // Create a new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const bcrypt = require('bcrypt');
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    
    // Create user with hashed password
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword
    });
    
    return await this.userRepository.save(user);
  }

  // Find admin by email (admin is a user with admin role)
  async findAdminByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, userType: 'admin' },
      relations: ['role']
    });
  }

  // Create a new admin (create user with admin role)
  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const bcrypt = require('bcrypt');
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    
    // Find admin role
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' }
    });
    
    if (!adminRole) {
      throw new Error('Admin role not found. Please create admin role first.');
    }
    
    // Create user with admin role
    const admin = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      userType: 'admin',
      roleId: adminRole.id
    });
    
    return await this.userRepository.save(admin);
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

  // Create a new role
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      ...createRoleDto,
      isActive: true
    });
    return await this.roleRepository.save(role);
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

  // Create alert and send email to all users
  async createAlertAndSendEmail(sendAlertEmailDto: SendAlertEmailDto): Promise<{
    alert: Alert;
    emailResult: { success: boolean; message: string; sentCount?: number; failedCount?: number };
  }> {
    // Create the alert in database
    const createAlertDto: CreateAlertDto = {
      title: sendAlertEmailDto.title,
      message: sendAlertEmailDto.message,
      type: sendAlertEmailDto.type,
      targetAudience: sendAlertEmailDto.targetAudience,
      expiresAt: sendAlertEmailDto.expiresAt,
      priority: sendAlertEmailDto.priority,
      isSystemWide: true,
    };

    const alert = await this.createAlert(createAlertDto);

    // Send email if requested
    let emailResult = { success: false, message: 'Email not sent' };
    if (sendAlertEmailDto.sendEmail !== false) {
      emailResult = await this.mailerService.sendAlertToAllUsers(alert);
    }

    return {
      alert,
      emailResult
    };
  }

  // Send existing alert via email
  async sendExistingAlert(alertId: number): Promise<{
    success: boolean;
    message: string;
    sentCount?: number;
    failedCount?: number;
  }> {
    const alert = await this.findAlertById(alertId);
    
    if (!alert) {
      return {
        success: false,
        message: 'Alert not found'
      };
    }

    if (alert.status !== 'active') {
      return {
        success: false,
        message: 'Only active alerts can be sent via email'
      };
    }

    return await this.mailerService.sendAlertToAllUsers(alert);
  }

  // Test SMTP connection
  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    const isConnected = await this.mailerService.testConnection();
    return {
      success: isConnected,
      message: isConnected ? 'SMTP connection successful' : 'SMTP connection failed'
    };
  }

  // Create test user and send test email
  async createTestUserAndSendEmail(email: string): Promise<{
    user: User;
    emailResult: { success: boolean; message: string };
  }> {
    // Create or get existing test user
    const testUser = await this.mailerService.createTestUser(email);
    
    // Send test email
    const emailResult = await this.mailerService.sendTestEmail(email, testUser.name);
    
    return {
      user: testUser,
      emailResult
    };
  }

  // Admin login method
  async loginAdmin(loginDto: LoginDto): Promise<{ access_token: string; admin: Omit<User, 'password'> }> {
    const bcrypt = require('bcrypt');
    
    // Find admin by email (user with admin role)
    const admin = await this.userRepository.findOne({
      where: { email: loginDto.email, userType: 'admin' },
      relations: ['role']
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create JWT payload
    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      userType: admin.userType,
      role: admin.role?.name || 'admin'
    };

    // Generate JWT token
    const access_token = await this.jwtService.signAsync(payload);

    // Return token and admin info (without password)
    const { password, ...adminWithoutPassword } = admin;
    
    return {
      access_token,
      admin: adminWithoutPassword
    };
  }
}
