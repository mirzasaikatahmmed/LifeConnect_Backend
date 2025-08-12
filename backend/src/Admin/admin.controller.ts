import { Controller, Get, Post, Body, Delete, Patch, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateUserRoleDto, CreateAlertDto, SendAlertEmailDto, CreateUserDto } from './admin.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('api')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /api/users - Retrieves a list of all users (Donors and Managers)
  @Get('users')
  async getAllUsers() {
    try {
      return await this.adminService.getAllUsers();
    } catch (error) {
      throw new HttpException('Failed to retrieve users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/users - Creates a new user account
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

  // POST /api/admins - Creates a new admin account
  @Post('admins')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    try {
      // Check if admin with this email already exists
      const existingAdmin = await this.adminService.findAdminByEmail(createAdminDto.email);
      if (existingAdmin) {
        throw new HttpException('Admin with this email already exists', HttpStatus.CONFLICT);
      }
      return await this.adminService.createAdmin(createAdminDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create admin', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE /api/users/:id - Deletes a user account
  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
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
    } catch (error) {
      throw new HttpException('Failed to retrieve roles', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // PATCH /api/users/:id/role - Updates a user's role
  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: number, @Body() updateUserRoleDto: UpdateUserRoleDto) {
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
  @Get('reports/donations')
  async getDonationReports() {
    try {
      return await this.adminService.getDonationReports();
    } catch (error) {
      throw new HttpException('Failed to generate donation reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /api/reports/requests - Generates a report on blood request statistics
  @Get('reports/requests')
  async getRequestReports() {
    try {
      return await this.adminService.getRequestReports();
    } catch (error) {
      throw new HttpException('Failed to generate request reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/alerts - Sends a new system-wide alert or notification
  @Post('alerts')
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    try {
      return await this.adminService.createAlert(createAlertDto);
    } catch (error) {
      throw new HttpException('Failed to create alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE /api/alerts/:id - Deletes a system-wide alert
  @Delete('alerts/:id')
  async deleteAlert(@Param('id') id: number) {
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

  // GET /api/alerts/active - Get all active alerts
  @Get('alerts/active')
  async getActiveAlerts() {
    try {
      return await this.adminService.getActiveAlerts();
    } catch (error) {
      throw new HttpException('Failed to retrieve active alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /api/alerts/send-email - Creates alert and sends email to all users
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
  @Post('alerts/:id/send-email')
  async sendExistingAlert(@Param('id') id: number) {
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
  @Post('mailer/test-send')
  async createTestUserAndSendEmail(@Body() body: { email: string }) {
    try {
      const result = await this.adminService.createTestUserAndSendEmail(body.email);
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
}
