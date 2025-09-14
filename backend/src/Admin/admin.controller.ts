/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Delete, Patch, Put, Param, UseGuards, HttpException, HttpStatus, ParseIntPipe, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto, CreateAlertDto, SendAlertEmailDto, CreateUserDto, UpdateUserDto, LoginDto, CreateRoleDto, TestEmailDto } from './admin.dto';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { CreateBloodRequestDto, UpdateBloodRequestDto } from '../Manager/dto files/bloodrequest.dto';

@Controller('api')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // POST /api/login - Universal login endpoint (accepts any user type)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.adminService.loginAdmin(loginDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users/me - Get current authenticated user
  @UseGuards(AuthGuard)
  @Get('users/me')
  async getCurrentUser(@Request() req) {
    try {
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }
      
      const user = await this.adminService.getCurrentUser(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve current user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users - Retrieves a list of all users 
  @UseGuards(AdminGuard)
  @Get('users')
  async getAllUsers() {
    try {
      return await this.adminService.getAllUsers();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Failed to retrieve users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users/:id - Get specific user by ID
  @UseGuards(AdminGuard)
  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users/details - Retrieves all users details (name, blood group, contact)
  @Get('users/details')
  async getAllUsersDetails() {
    try {
      return await this.adminService.getAllUsersDetails();
    } catch (error) {
      throw new HttpException('Failed to retrieve users details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/users - Creates a new user account
  @UseGuards(AdminGuard)
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      // Check if user with this email already exists
      const existingUser = await this.adminService.findUserByEmail(createUserDto.email);
      if (existingUser) {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }
      return await this.adminService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/bootstrap-admin - Creates the first admin account (no auth required)
  @Post('bootstrap-admin')
  async bootstrapAdmin(@Body() createUserDto: CreateUserDto) {
    try {
      // Check if any admin already exists
      const existingAdmins = await this.adminService.findAdminByEmail(createUserDto.email);
      if (existingAdmins) {
        throw new HttpException('Admin with this email already exists', HttpStatus.CONFLICT);
      }
      
      return await this.adminService.createAdmin(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create bootstrap admin', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/admins - Creates a new admin account
  @UseGuards(AdminGuard)
  @Post('admins')
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    try {
      // Check if admin with this email already exists
      const existingAdmin = await this.adminService.findAdminByEmail(createUserDto.email);
      if (existingAdmin) {
        throw new HttpException('Admin with this email already exists', HttpStatus.CONFLICT);
      }
      return await this.adminService.createAdmin(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create admin', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/admin-register - Admin registration endpoint (forces admin role)
  @Post('admin-register')
  async registerAdmin(@Body() createUserDto: CreateUserDto) {
    try {
      // Check if admin with this email already exists
      const existingAdmin = await this.adminService.findAdminByEmail(createUserDto.email);
      if (existingAdmin) {
        throw new HttpException('Admin with this email already exists', HttpStatus.CONFLICT);
      }
      return await this.adminService.registerAdmin(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to register admin account', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PUT /api/users/:id - Updates a user account
  @UseGuards(AdminGuard)
  @Put('users/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.updateUser(id, updateUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PATCH /api/users/:id - Partially updates a user account
  @UseGuards(AdminGuard)
  @Patch('users/:id')
  async patchUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.updateUser(id, updateUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to patch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE /api/users/:id - Deletes a user account
  @UseGuards(AdminGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.deleteUser(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/roles - Retrieves a list of all available roles
  @Get('roles')
  async getAllRoles() {
    try {
      return await this.adminService.getAllRoles();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Failed to retrieve roles', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/roles - Creates a new role
 // @UseGuards(AdminGuard)
  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    try {
      return await this.adminService.createRole(createRoleDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Failed to create role', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PATCH /api/users/:id/role - Updates a user's role
  @UseGuards(AdminGuard)
  @Patch('users/:id/role')
  async updateUserRole(@Param('id', ParseIntPipe) id: number, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.updateUserRole(id, updateUserRoleDto.roleId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update user role', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/donations - Generates a report on donation statistics
  @UseGuards(AdminGuard)
  @Get('reports/donations')
  async getDonationReports() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.adminService.getDonationReports();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Failed to generate donation reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/requests - Generates a report on blood request statistics
  @UseGuards(AdminGuard)
  @Get('reports/requests')
  async getRequestReports() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.adminService.getRequestReports();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Failed to generate request reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/alerts - Sends a new system-wide alert or notification
  @UseGuards(AdminGuard)
  @Post('alerts')
  async createAlert(@Body() createAlertDto: CreateAlertDto, @Request() req) {
    try {
      // Get user ID from JWT token
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      // Add userId to the alert data
      const alertDataWithUser = {
        ...createAlertDto,
        userId: userId
      };

      return await this.adminService.createAlert(alertDataWithUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE /api/alerts/:id - Deletes a system-wide alert
  @UseGuards(AdminGuard)
  @Delete('alerts/:id')
  async deleteAlert(@Param('id', ParseIntPipe) id: number) {
    try {
      const alert = await this.adminService.findAlertById(id);
      if (!alert) {
        throw new HttpException('Alert not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.deleteAlert(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/alerts - Get all alerts
  @UseGuards(AdminGuard)
  @Get('alerts')
  async getAllAlerts() {
    try {
      return await this.adminService.getAllAlerts();
    } catch (error) {
      throw new HttpException('Failed to retrieve alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/alerts/active - Get all active alerts
  @UseGuards(AdminGuard)
  @Get('alerts/active')
  async getActiveAlerts() {
    try {
      return await this.adminService.getActiveAlerts();
    } catch (error) {
      throw new HttpException('Failed to retrieve active alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/alerts/send-email - Creates alert and sends email to all users
  @UseGuards(AdminGuard)
  @Post('alerts/send-email')
  async createAlertAndSendEmail(@Body() sendAlertEmailDto: SendAlertEmailDto) {
    try {
      const result = await this.adminService.createAlertAndSendEmail(sendAlertEmailDto);
      return {
        success: true,
        message: 'Alert created and email process initiated',
        data: {
          alert: result.alert,
          emailResult: result.emailResult
        }
      };
    } catch (error) {
      throw new HttpException('Failed to create alert or send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/alerts/:id/send-email - Sends existing alert via email to all users
  @UseGuards(AdminGuard)
  @Post('alerts/:id/send-email')
  async sendExistingAlert(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.adminService.sendExistingAlert(id);
      return {
        success: result.success,
        message: result.message,
        data: {
          sentCount: result.sentCount,
          failedCount: result.failedCount
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to send alert email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/mailer/test-connection - Test SMTP connection
  @UseGuards(AdminGuard)
  @Get('mailer/test-connection')
  async testEmailConnection() {
    try {
      const result = await this.adminService.testEmailConnection();
      return {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException('Failed to test email connection', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/mailer/test-send - Create test user and send test email
  @UseGuards(AdminGuard)
  @Post('mailer/test-send')
  async createTestUserAndSendEmail(@Body() testEmailDto: TestEmailDto) {
    try {
      const result = await this.adminService.createTestUserAndSendEmail(testEmailDto.email);
      return {
        success: result.emailResult.success,
        message: 'Test user created and email sent',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            userType: result.user.userType
          },
          emailResult: result.emailResult
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException('Failed to create test user or send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/auth-debug - Debug authentication (temporary endpoint)
  @UseGuards(AuthGuard)
  @Get('auth-debug')
  async debugAuth(@Request() req) {
    try {
      return {
        success: true,
        message: 'Authentication successful',
        user: req.user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException('Authentication debug failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/blood-requests - Get all blood requests (try with basic auth first)
  @UseGuards(AuthGuard)
  @Get('blood-requests')
  async getAllBloodRequests(@Request() req) {
    try {
      // Check if user has admin privileges
      if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
        throw new HttpException('Admin privileges required', HttpStatus.FORBIDDEN);
      }
      return await this.adminService.getAllBloodRequests();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve blood requests', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/blood-requests-alt - Alternative blood requests endpoint with less strict auth
  @UseGuards(AuthGuard)
  @Get('blood-requests-alt')
  async getAllBloodRequestsAlt(@Request() req) {
    try {
      console.log('User accessing blood requests:', req.user);
      return await this.adminService.getAllBloodRequests();
    } catch (error) {
      console.error('Error in blood-requests-alt:', error);
      throw new HttpException('Failed to retrieve blood requests', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/blood-requests/:id - Get blood request by ID
  @UseGuards(AuthGuard)
  @Get('blood-requests/:id')
  async getBloodRequestById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      // Check if user has admin privileges
      if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
        throw new HttpException('Admin privileges required', HttpStatus.FORBIDDEN);
      }

      const bloodRequest = await this.adminService.getBloodRequestById(id);
      if (!bloodRequest) {
        throw new HttpException('Blood request not found', HttpStatus.NOT_FOUND);
      }
      return bloodRequest;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve blood request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/blood-requests - Create a new blood request
  @UseGuards(AuthGuard)
  @Post('blood-requests')
  async createBloodRequest(@Body() createBloodRequestDto: CreateBloodRequestDto, @Request() req) {
    try {
      console.log('Creating blood request with data:', createBloodRequestDto);
      console.log('User from request:', req.user);

      // Check if user has admin privileges
      if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
        throw new HttpException('Admin privileges required', HttpStatus.FORBIDDEN);
      }

      // Add the user ID from the authenticated admin
      const bloodRequestData = {
        ...createBloodRequestDto,
        userId: req.user.sub || req.user.id || 1 // fallback to 1 if no user ID
      };

      console.log('Final blood request data:', bloodRequestData);
      const result = await this.adminService.createBloodRequest(bloodRequestData);
      console.log('Blood request created successfully:', result);

      return result;
    } catch (error) {
      console.error('Error creating blood request:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create blood request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/blood-requests-simple - Simple blood request creation (for testing)
  @UseGuards(AuthGuard)
  @Post('blood-requests-simple')
  async createBloodRequestSimple(@Body() createBloodRequestDto: any, @Request() req) {
    try {
      console.log('Simple blood request creation:', createBloodRequestDto);
      console.log('User:', req.user);

      const bloodRequestData = {
        bloodType: createBloodRequestDto.bloodType,
        urgencyLevel: createBloodRequestDto.urgencyLevel,
        hospitalName: createBloodRequestDto.hospitalName,
        hospitalAddress: createBloodRequestDto.hospitalAddress,
        neededBy: new Date(createBloodRequestDto.neededBy),
        unitsNeeded: createBloodRequestDto.unitsNeeded || 1,
        userId: 1, // Use hardcoded for testing
        status: 'active'
      };

      return await this.adminService.createBloodRequest(bloodRequestData);
    } catch (error) {
      console.error('Simple blood request creation error:', error);
      throw new HttpException(error.message || 'Failed to create blood request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PATCH /api/blood-requests/:id - Update blood request
  @UseGuards(AuthGuard)
  @Patch('blood-requests/:id')
  async updateBloodRequest(@Param('id', ParseIntPipe) id: number, @Body() updateBloodRequestDto: UpdateBloodRequestDto, @Request() req) {
    try {
      console.log(`Updating blood request ${id} with data:`, updateBloodRequestDto);
      console.log('User from request:', req.user);

      // Check if user has admin privileges
      if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
        throw new HttpException('Admin privileges required', HttpStatus.FORBIDDEN);
      }

      const bloodRequest = await this.adminService.getBloodRequestById(id);
      if (!bloodRequest) {
        throw new HttpException('Blood request not found', HttpStatus.NOT_FOUND);
      }

      console.log('Original blood request:', bloodRequest);
      const updatedBloodRequest = await this.adminService.updateBloodRequest(id, updateBloodRequestDto);
      console.log('Updated blood request:', updatedBloodRequest);

      return updatedBloodRequest;
    } catch (error) {
      console.error(`Error updating blood request ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update blood request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PATCH /api/blood-requests/:id/simple - Simple update endpoint (for testing)
  @UseGuards(AuthGuard)
  @Patch('blood-requests/:id/simple')
  async updateBloodRequestSimple(@Param('id', ParseIntPipe) id: number, @Body() updateData: any, @Request() req) {
    try {
      console.log(`Simple update for blood request ${id}:`, updateData);

      // Check if user has admin privileges
      if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
        throw new HttpException('Admin privileges required', HttpStatus.FORBIDDEN);
      }

      const bloodRequest = await this.adminService.getBloodRequestById(id);
      if (!bloodRequest) {
        throw new HttpException('Blood request not found', HttpStatus.NOT_FOUND);
      }

      // Manual field mapping for simple update
      const updateDto: any = {};

      if (updateData.bloodType) updateDto.bloodType = updateData.bloodType;
      if (updateData.urgencyLevel) updateDto.urgencyLevel = updateData.urgencyLevel;
      if (updateData.hospitalName) updateDto.hospitalName = updateData.hospitalName;
      if (updateData.hospitalAddress) updateDto.hospitalAddress = updateData.hospitalAddress;
      if (updateData.neededBy) updateDto.neededBy = new Date(updateData.neededBy);
      if (updateData.unitsNeeded) updateDto.unitsNeeded = parseInt(updateData.unitsNeeded);
      if (updateData.status) updateDto.status = updateData.status;

      return await this.adminService.updateBloodRequest(id, updateDto);
    } catch (error) {
      console.error(`Simple update error for blood request ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Failed to update blood request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE /api/blood-requests/:id - Delete blood request
  @UseGuards(AuthGuard)
  @Delete('blood-requests/:id')
  async deleteBloodRequest(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      // Check if user has admin privileges
      if (req.user?.role !== 'admin' && req.user?.userType !== 'admin') {
        throw new HttpException('Admin privileges required', HttpStatus.FORBIDDEN);
      }

      const bloodRequest = await this.adminService.getBloodRequestById(id);
      if (!bloodRequest) {
        throw new HttpException('Blood request not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.deleteBloodRequest(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete blood request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users/:id/activity - Get user activity logs
  @UseGuards(AdminGuard)
  @Get('users/:id/activity')
  async getUserActivity(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.getUserActivity(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve user activity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users/:id/login-history - Get user login history
  @UseGuards(AdminGuard)
  @Get('users/:id/login-history')
  async getUserLoginHistory(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.adminService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return await this.adminService.getUserLoginHistory(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve user login history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/users/export - Export users to CSV/Excel
  @UseGuards(AdminGuard)
  @Get('users/export')
  async exportUsers() {
    try {
      return await this.adminService.exportUsers();
    } catch (error) {
      throw new HttpException('Failed to export users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/dashboard/stats - Overall system statistics
  @UseGuards(AdminGuard)
  @Get('dashboard/stats')
  async getDashboardStats() {
    try {
      return await this.adminService.getDashboardStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve dashboard statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/dashboard/charts - Chart data for admin dashboard
  @UseGuards(AdminGuard)
  @Get('dashboard/charts')
  async getDashboardCharts() {
    try {
      return await this.adminService.getDashboardCharts();
    } catch (error) {
      throw new HttpException('Failed to retrieve dashboard charts data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/users - User statistics
  @UseGuards(AdminGuard)
  @Get('reports/users')
  async getUserReports() {
    try {
      return await this.adminService.getUserReports();
    } catch (error) {
      throw new HttpException('Failed to generate user reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/activity - System activity reports
  @UseGuards(AdminGuard)
  @Get('reports/activity')
  async getActivityReports() {
    try {
      return await this.adminService.getActivityReports();
    } catch (error) {
      throw new HttpException('Failed to generate activity reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/blood-compatibility - Blood compatibility analysis
  @UseGuards(AdminGuard)
  @Get('reports/blood-compatibility')
  async getBloodCompatibilityReports() {
    try {
      return await this.adminService.getBloodCompatibilityReports();
    } catch (error) {
      throw new HttpException('Failed to generate blood compatibility reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/monthly-summary - Monthly summary reports
  @UseGuards(AdminGuard)
  @Get('reports/monthly-summary')
  async getMonthlySummaryReports() {
    try {
      return await this.adminService.getMonthlySummaryReports();
    } catch (error) {
      throw new HttpException('Failed to generate monthly summary reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/admin/settings - Get system configuration settings
  @UseGuards(AdminGuard)
  @Get('admin/settings')
  async getSystemSettings() {
    try {
      return await this.adminService.getSystemSettings();
    } catch (error) {
      throw new HttpException('Failed to retrieve system settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PUT /api/admin/settings - Update system configuration settings
  @UseGuards(AdminGuard)
  @Put('admin/settings')
  async updateSystemSettings(@Body() settings: any) {
    try {
      return await this.adminService.updateSystemSettings(settings);
    } catch (error) {
      throw new HttpException('Failed to update system settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/admin/system-info - Get system information
  @UseGuards(AdminGuard)
  @Get('admin/system-info')
  async getSystemInfo() {
    try {
      return await this.adminService.getSystemInfo();
    } catch (error) {
      throw new HttpException('Failed to retrieve system information', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/email/templates - Get email templates
  @UseGuards(AdminGuard)
  @Get('email/templates')
  async getEmailTemplates() {
    try {
      return await this.adminService.getEmailTemplates();
    } catch (error) {
      throw new HttpException('Failed to retrieve email templates', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/email/templates - Create new email template
  @UseGuards(AdminGuard)
  @Post('email/templates')
  async createEmailTemplate(@Body() template: any) {
    try {
      return await this.adminService.createEmailTemplate(template);
    } catch (error) {
      throw new HttpException('Failed to create email template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PUT /api/email/templates/:id - Update email template
  @UseGuards(AdminGuard)
  @Put('email/templates/:id')
  async updateEmailTemplate(@Param('id', ParseIntPipe) id: number, @Body() template: any) {
    try {
      return await this.adminService.updateEmailTemplate(id, template);
    } catch (error) {
      throw new HttpException('Failed to update email template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE /api/email/templates/:id - Delete email template
  @UseGuards(AdminGuard)
  @Delete('email/templates/:id')
  async deleteEmailTemplate(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.adminService.deleteEmailTemplate(id);
    } catch (error) {
      throw new HttpException('Failed to delete email template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/email/history - Get email sending history
  @UseGuards(AdminGuard)
  @Get('email/history')
  async getEmailHistory() {
    try {
      return await this.adminService.getEmailHistory();
    } catch (error) {
      throw new HttpException('Failed to retrieve email history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/email/send-bulk - Send bulk email to users
  @UseGuards(AdminGuard)
  @Post('email/send-bulk')
  async sendBulkEmail(@Body() emailData: any) {
    try {
      return await this.adminService.sendBulkEmail(emailData);
    } catch (error) {
      throw new HttpException('Failed to send bulk email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/email/settings - Get email server settings
  @UseGuards(AdminGuard)
  @Get('email/settings')
  async getEmailSettings() {
    try {
      return await this.adminService.getEmailSettings();
    } catch (error) {
      throw new HttpException('Failed to retrieve email settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PUT /api/email/settings - Update email server settings
  @UseGuards(AdminGuard)
  @Put('email/settings')
  async updateEmailSettings(@Body() settings: any) {
    try {
      return await this.adminService.updateEmailSettings(settings);
    } catch (error) {
      throw new HttpException('Failed to update email settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/blood-request-analytics - Blood request analytics
  @UseGuards(AdminGuard)
  @Get('reports/blood-request-analytics')
  async getBloodRequestAnalytics() {
    try {
      return await this.adminService.getBloodRequestAnalytics();
    } catch (error) {
      throw new HttpException('Failed to generate blood request analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/donation-analytics - Donation analytics
  @UseGuards(AdminGuard)
  @Get('reports/donation-analytics')
  async getDonationAnalytics() {
    try {
      return await this.adminService.getDonationAnalytics();
    } catch (error) {
      throw new HttpException('Failed to generate donation analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
