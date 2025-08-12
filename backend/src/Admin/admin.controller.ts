import { Controller, Get, Post, Body, Delete, Patch, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateUserRoleDto, CreateAlertDto } from './admin.dto';
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
}
