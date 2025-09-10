import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Alert } from './entities/alert.entity';
import { BloodRequest } from '../Manager/Entities/bloodrequest.entity';
import {
  CreateAlertDto,
  SendAlertEmailDto,
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  CreateRoleDto,
} from './admin.dto';
import {
  CreateBloodRequestDto,
  UpdateBloodRequestDto,
} from '../Manager/dto files/bloodrequest.dto';
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
    @InjectRepository(BloodRequest)
    private bloodRequestRepository: Repository<BloodRequest>,
    private mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  // Get all users (Donors and Managers)
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  // Find user by ID
  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  // Create a new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const bcrypt = require('bcrypt');

    // Validate that the role exists
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.roleId, isActive: true },
    });

    if (!role) {
      throw new Error(
        `Role with ID ${createUserDto.roleId} not found or inactive`,
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Create user with hashed password
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Return user with role information populated
    const userWithRole = await this.findUserById(savedUser.id);
    if (!userWithRole) {
      throw new Error('Failed to retrieve created user');
    }
    return userWithRole;
  }

  // Find admin by email (admin is a user with admin role)
  async findAdminByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, userType: 'admin' },
      relations: ['role'],
    });
  }

  // Create a new admin (create user with admin role)
  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const bcrypt = require('bcrypt');

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Find admin role
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found. Please create admin role first.');
    }

    // Create user with admin role
    const admin = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      userType: 'admin',
      roleId: adminRole.id,
    });

    return await this.userRepository.save(admin);
  }

  // Register a new admin account (enforces admin role)
  async registerAdmin(createUserDto: CreateUserDto): Promise<User> {
    const bcrypt = require('bcrypt');

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Find admin role (ignore roleId from DTO, always use admin role)
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin', isActive: true },
    });

    if (!adminRole) {
      throw new Error('Admin role not found or is inactive. Please ensure admin role exists and is active.');
    }

    // Create admin user (always with admin role, ignore roleId from DTO)
    const admin = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      phoneNumber: createUserDto.phoneNumber,
      bloodType: createUserDto.bloodType,
      userType: 'admin',  // Force admin userType
      roleId: adminRole.id,  // Force admin roleId
      isActive: true,
      isVerified: false,
    });

    const savedAdmin = await this.userRepository.save(admin);

    // Return admin with role information populated
    const adminWithRole = await this.findUserById(savedAdmin.id);
    if (!adminWithRole) {
      throw new Error('Failed to retrieve created admin');
    }
    return adminWithRole;
  }

  // Update a user account
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findUserById(id);
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
      order: { name: 'ASC' },
    });
  }

  // Create a new role
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      ...createRoleDto,
      isActive: true,
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
    const totalUsers = await this.userRepository.count({
      where: { userType: 'donor' },
    });
    const activeUsers = await this.userRepository.count({
      where: { userType: 'donor', isActive: true },
    });

    return {
      totalDonors: totalUsers,
      activeDonors: activeUsers,
      inactiveDonors: totalUsers - activeUsers,
      bloodTypeDistribution: {},
      monthlyDonations: [],
      generatedAt: new Date(),
    };
  }

  // Generate blood request statistics report
  async getRequestReports(): Promise<any> {
    const totalManagers = await this.userRepository.count({
      where: { userType: 'manager' },
    });

    return {
      totalManagers: totalManagers,
      // Additional request statistics would be calculated here
      pendingRequests: 0,
      fulfilledRequests: 0,
      monthlyRequests: [],
      generatedAt: new Date(),
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
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  // Create alert and send email to all users
  async createAlertAndSendEmail(sendAlertEmailDto: SendAlertEmailDto): Promise<{
    alert: Alert;
    emailResult: {
      success: boolean;
      message: string;
      sentCount?: number;
      failedCount?: number;
    };
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
      emailResult,
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
        message: 'Alert not found',
      };
    }

    if (alert.status !== 'active') {
      return {
        success: false,
        message: 'Only active alerts can be sent via email',
      };
    }

    return await this.mailerService.sendAlertToAllUsers(alert);
  }

  // Test SMTP connection
  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    const isConnected = await this.mailerService.testConnection();
    return {
      success: isConnected,
      message: isConnected
        ? 'SMTP connection successful'
        : 'SMTP connection failed',
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
    const emailResult = await this.mailerService.sendTestEmail(
      email,
      testUser.name,
    );

    return {
      user: testUser,
      emailResult,
    };
  }

  // Universal login method - accepts any user type (admin, manager, donor)
  async loginAdmin(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; admin: Omit<User, 'password'> }> {
    const bcrypt = require('bcrypt');

    // Find user by email (any user type)
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create JWT payload with user's actual role and type
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role?.name || user.userType,
    };

    // Generate JWT token
    const access_token = await this.jwtService.signAsync(payload);

    // Return token and user info (without password)
    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      admin: userWithoutPassword,
    };
  }

  // Get all blood requests
  async getAllBloodRequests(): Promise<BloodRequest[]> {
    return await this.bloodRequestRepository.find({
      relations: ['postedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get blood request by ID
  async getBloodRequestById(id: number): Promise<BloodRequest | null> {
    return await this.bloodRequestRepository.findOne({
      where: { id },
      relations: ['postedBy'],
    });
  }

  // Create a new blood request
  async createBloodRequest(
    createBloodRequestDto: CreateBloodRequestDto,
  ): Promise<BloodRequest> {
    const bloodRequest = this.bloodRequestRepository.create({
      ...createBloodRequestDto,
      userId: 1,
    });
    return await this.bloodRequestRepository.save(bloodRequest);
  }

  // Update a blood request
  async updateBloodRequest(
    id: number,
    updateBloodRequestDto: UpdateBloodRequestDto,
  ): Promise<BloodRequest | null> {
    await this.bloodRequestRepository.update(id, updateBloodRequestDto);
    return await this.getBloodRequestById(id);
  }

  // Delete a blood request
  async deleteBloodRequest(id: number): Promise<{ message: string }> {
    await this.bloodRequestRepository.delete(id);
    return { message: 'Blood request deleted successfully' };
  }

  // Get user activity logs (mock implementation)
  async getUserActivity(userId: number): Promise<any> {
    // Mock data - in production, this would query a UserActivity entity
    const mockActivities = [
      {
        id: 1,
        action: 'login',
        description: 'User logged in',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: 2,
        action: 'profile_update',
        description: 'User updated their profile information',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
      {
        id: 3,
        action: 'logout',
        description: 'User logged out',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
      },
    ];

    return {
      userId,
      activities: mockActivities,
      total: mockActivities.length,
    };
  }

  // Get user login history (mock implementation)
  async getUserLoginHistory(userId: number): Promise<any> {
    // Mock data - in production, this would query login-specific activities
    const mockLoginHistory = [
      {
        id: 1,
        loginTime: new Date(Date.now() - 86400000),
        logoutTime: new Date(Date.now() - 82800000), // 1 hour later
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, NY',
        deviceType: 'Desktop',
      },
      {
        id: 2,
        loginTime: new Date(Date.now() - 172800000),
        logoutTime: new Date(Date.now() - 169200000),
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
        location: 'New York, NY',
        deviceType: 'Mobile',
      },
    ];

    return {
      userId,
      loginHistory: mockLoginHistory,
      total: mockLoginHistory.length,
      lastLogin: mockLoginHistory[0]?.loginTime,
    };
  }

  // Export users to CSV format
  async exportUsers(): Promise<any> {
    const users = await this.userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    const csvData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bloodType: user.bloodType,
      userType: user.userType,
      role: user.role?.name || 'N/A',
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      success: true,
      message: 'Users exported successfully',
      data: csvData,
      totalRecords: csvData.length,
      exportedAt: new Date(),
      format: 'CSV',
    };
  }

  // Get overall system statistics
  async getDashboardStats(): Promise<any> {
    const [
      totalUsers,
      totalDonors,
      totalManagers,
      totalAdmins,
      activeUsers,
      totalBloodRequests,
      activeBloodRequests,
      totalAlerts,
      activeAlerts,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { userType: 'donor' } }),
      this.userRepository.count({ where: { userType: 'manager' } }),
      this.userRepository.count({ where: { userType: 'admin' } }),
      this.userRepository.count({ where: { isActive: true } }),
      this.bloodRequestRepository.count(),
      this.bloodRequestRepository.count({ where: { status: 'active' } }),
      this.alertRepository.count(),
      this.alertRepository.count({ where: { status: 'active' } }),
    ]);

    const bloodTypeStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.bloodType', 'bloodType')
      .addSelect('COUNT(*)', 'count')
      .where('user.bloodType IS NOT NULL')
      .groupBy('user.bloodType')
      .getRawMany();

    return {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
      },
      userTypes: {
        donors: totalDonors,
        managers: totalManagers,
        admins: totalAdmins,
      },
      bloodRequests: {
        total: totalBloodRequests,
        active: activeBloodRequests,
        completed: totalBloodRequests - activeBloodRequests,
      },
      alerts: {
        total: totalAlerts,
        active: activeAlerts,
      },
      bloodTypeDistribution: bloodTypeStats.reduce((acc, item) => {
        acc[item.bloodType] = parseInt(item.count);
        return acc;
      }, {}),
      lastUpdated: new Date(),
    };
  }

  // Get chart data for admin dashboard
  async getDashboardCharts(): Promise<any> {
    // User registration chart (last 12 months)
    const userRegistrationData: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await this.userRepository.count({
        where: {
          createdAt: Between(startOfMonth, endOfMonth),
        },
      });

      userRegistrationData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: count,
      });
    }

    // Blood request trends (last 6 months)
    const bloodRequestData: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await this.bloodRequestRepository.count({
        where: {
          createdAt: Between(startOfMonth, endOfMonth),
        },
      });

      bloodRequestData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        requests: count,
      });
    }

    return {
      userRegistrations: {
        title: 'User Registrations (Last 12 Months)',
        data: userRegistrationData,
      },
      bloodRequests: {
        title: 'Blood Requests (Last 6 Months)',
        data: bloodRequestData,
      },
      bloodTypeDistribution: {
        title: 'Blood Type Distribution',
        data: [
          { bloodType: 'O+', count: Math.floor(Math.random() * 100) + 50 },
          { bloodType: 'A+', count: Math.floor(Math.random() * 80) + 40 },
          { bloodType: 'B+', count: Math.floor(Math.random() * 60) + 30 },
          { bloodType: 'AB+', count: Math.floor(Math.random() * 40) + 20 },
          { bloodType: 'O-', count: Math.floor(Math.random() * 50) + 25 },
          { bloodType: 'A-', count: Math.floor(Math.random() * 40) + 20 },
          { bloodType: 'B-', count: Math.floor(Math.random() * 30) + 15 },
          { bloodType: 'AB-', count: Math.floor(Math.random() * 20) + 10 },
        ],
      },
      generatedAt: new Date(),
    };
  }

  // Generate user statistics report
  async getUserReports(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const usersByType = await this.userRepository
      .createQueryBuilder('user')
      .select('user.userType', 'userType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.userType')
      .getRawMany();

    const usersByBloodType = await this.userRepository
      .createQueryBuilder('user')
      .select('user.bloodType', 'bloodType')
      .addSelect('COUNT(*)', 'count')
      .where('user.bloodType IS NOT NULL')
      .groupBy('user.bloodType')
      .getRawMany();

    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const verifiedUsers = await this.userRepository.count({ where: { isVerified: true } });

    // Users registered in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersLast30Days = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    return {
      summary: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersLast30Days,
        activationRate: ((activeUsers / totalUsers) * 100).toFixed(2) + '%',
        verificationRate: ((verifiedUsers / totalUsers) * 100).toFixed(2) + '%',
      },
      usersByType: usersByType.reduce((acc, item) => {
        acc[item.userType] = parseInt(item.count);
        return acc;
      }, {}),
      usersByBloodType: usersByBloodType.reduce((acc, item) => {
        acc[item.bloodType] = parseInt(item.count);
        return acc;
      }, {}),
      generatedAt: new Date(),
    };
  }

  // Generate system activity reports
  async getActivityReports(): Promise<any> {
    // Mock activity data - in production, this would query actual activity logs
    const totalLogins = Math.floor(Math.random() * 1000) + 500;
    const uniqueActiveUsers = Math.floor(Math.random() * 200) + 100;
    const averageSessionDuration = Math.floor(Math.random() * 60) + 15; // minutes

    const activityByDay: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      activityByDay.push({
        date: date.toLocaleDateString(),
        logins: Math.floor(Math.random() * 100) + 20,
        uniqueUsers: Math.floor(Math.random() * 50) + 10,
        avgSessionDuration: Math.floor(Math.random() * 45) + 15,
      });
    }

    return {
      summary: {
        totalLogins,
        uniqueActiveUsers,
        averageSessionDuration: `${averageSessionDuration} minutes`,
        mostActiveHour: '14:00 - 15:00',
        leastActiveHour: '03:00 - 04:00',
      },
      dailyActivity: activityByDay,
      topActions: [
        { action: 'login', count: totalLogins },
        { action: 'profile_view', count: Math.floor(totalLogins * 0.8) },
        { action: 'blood_request_view', count: Math.floor(totalLogins * 0.6) },
        { action: 'profile_update', count: Math.floor(totalLogins * 0.3) },
        { action: 'logout', count: Math.floor(totalLogins * 0.9) },
      ],
      generatedAt: new Date(),
    };
  }

  // Generate blood compatibility analysis
  async getBloodCompatibilityReports(): Promise<any> {
    const bloodCompatibility = {
      'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
      'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
      'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
      'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
      'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
      'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
      'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
      'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] },
    };

    const bloodTypeStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.bloodType', 'bloodType')
      .addSelect('COUNT(*)', 'count')
      .where('user.bloodType IS NOT NULL AND user.userType = :userType', { userType: 'donor' })
      .groupBy('user.bloodType')
      .getRawMany();

    const donorsByBloodType = bloodTypeStats.reduce((acc, item) => {
      acc[item.bloodType] = parseInt(item.count);
      return acc;
    }, {});

    // Calculate compatibility matches
    const compatibilityAnalysis = {};
    Object.keys(bloodCompatibility).forEach(bloodType => {
      const donors = donorsByBloodType[bloodType] || 0;
      const canDonateTo = bloodCompatibility[bloodType].canDonateTo;
      const potentialRecipients = canDonateTo.reduce((sum, type) => {
        return sum + (donorsByBloodType[type] || 0);
      }, 0);

      compatibilityAnalysis[bloodType] = {
        availableDonors: donors,
        canDonateTo: canDonateTo.length,
        potentialRecipients,
        compatibilityScore: (canDonateTo.length / 8 * 100).toFixed(1) + '%',
      };
    });

    return {
      bloodCompatibilityMatrix: bloodCompatibility,
      donorDistribution: donorsByBloodType,
      compatibilityAnalysis,
      recommendations: [
        {
          bloodType: 'O-',
          message: 'Universal donor - critical for emergency situations',
          priority: 'High',
        },
        {
          bloodType: 'AB+',
          message: 'Universal recipient - can receive from any blood type',
          priority: 'Low',
        },
        {
          bloodType: 'O+',
          message: 'Most common blood type - high demand',
          priority: 'Medium',
        },
      ],
      generatedAt: new Date(),
    };
  }

  // Generate monthly summary reports
  async getMonthlySummaryReports(): Promise<any> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // First day of current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    // First day of next month
    const monthEnd = new Date(currentYear, currentMonth + 1, 1);

    const [
      newUsersThisMonth,
      newBloodRequestsThisMonth,
      newAlertsThisMonth,
    ] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      }),
      this.bloodRequestRepository.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      }),
      this.alertRepository.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      }),
    ]);

    // Previous month for comparison
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 1);

    const [
      newUsersLastMonth,
      newBloodRequestsLastMonth,
    ] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: Between(prevMonthStart, prevMonthEnd),
        },
      }),
      this.bloodRequestRepository.count({
        where: {
          createdAt: Between(prevMonthStart, prevMonthEnd),
        },
      }),
    ]);

    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : '0';

    const requestGrowth = newBloodRequestsLastMonth > 0
      ? ((newBloodRequestsThisMonth - newBloodRequestsLastMonth) / newBloodRequestsLastMonth * 100).toFixed(1)
      : '0';

    return {
      period: {
        month: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate: monthStart,
        endDate: new Date(monthEnd.getTime() - 1), // Last day of current month
      },
      summary: {
        newUsers: newUsersThisMonth,
        newBloodRequests: newBloodRequestsThisMonth,
        newAlerts: newAlertsThisMonth,
        userGrowth: `${userGrowth}%`,
        requestGrowth: `${requestGrowth}%`,
      },
      comparison: {
        previousMonth: {
          newUsers: newUsersLastMonth,
          newBloodRequests: newBloodRequestsLastMonth,
        },
      },
      topMetrics: [
        {
          metric: 'User Registrations',
          thisMonth: newUsersThisMonth,
          lastMonth: newUsersLastMonth,
          change: userGrowth + '%',
          trend: parseFloat(userGrowth) >= 0 ? 'up' : 'down',
        },
        {
          metric: 'Blood Requests',
          thisMonth: newBloodRequestsThisMonth,
          lastMonth: newBloodRequestsLastMonth,
          change: requestGrowth + '%',
          trend: parseFloat(requestGrowth) >= 0 ? 'up' : 'down',
        },
      ],
      generatedAt: new Date(),
    };
  }
}
