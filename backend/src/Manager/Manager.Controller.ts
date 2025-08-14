import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ManagerService } from './Manager.Service';
import { CreateManagerDto } from './dto files/manager.dto';
import { ManagerEntity } from './Entities/Manager.entity';
import { CreateRoleDto, CreateUserDto, LoginDto } from 'src/Admin/admin.dto';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';
import { ManagerGuard } from './guards/manager.guard';
import { JwtGuard } from 'src/Admin/guards/jwt.guard';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) { }
  @Post('createaccount')
  @UsePipes(new ValidationPipe())
  createaccount(@Body() data: CreateManagerDto): Promise<ManagerEntity> {
    return this.managerService.createaccount(data);
  }
  // @Post('createaccount')
  // @UsePipes(new ValidationPipe())
  // async createaccount(@Body() data: CreateManagerDto): Promise<ManagerEntity> {
  //   const newManager = await this.managerService.createaccount(data);
  //   await this.managerService.sendWelcomeEmail(newManager.email, newManager.username);
  //   return newManager;
  // }
  @Post('createmanagerUser')
  @UsePipes(new ValidationPipe())
  createManagerUser(@Body() data: CreateUserDto): Promise<User> {
    return this.managerService.createManagerUser(data);
  }

  @Get('allmanagers')
  @UseGuards(ManagerGuard)
  getAllManagers() {
    return this.managerService.getAllManagers();
  }
  @Get(':id')
  @UseGuards(ManagerGuard)
  getManagerById(@Param('id', ParseIntPipe) id: number): Promise<ManagerEntity> {
    return this.managerService.getManagerById(id);
  }
  @Patch(':id')
  @UseGuards(ManagerGuard)
  async updateManager(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<ManagerEntity>
  ): Promise<ManagerEntity> {
    // return this.managerService.updateManager(id, updateData);
    const update = await this.managerService.updateManager(id, updateData)
    await this.managerService.sendUpdateEmail(update.email, update.username)
    return update
  }

  @Post('createrole')
  @UsePipes(new ValidationPipe())
  createRole(@Body() data: CreateRoleDto): Promise<Role> {
    return this.managerService.createRole(data);
  }
  @Delete('users/:id')
  deleteuser(@Param('id', ParseIntPipe) id: number): any {
    return this.managerService.deleteuserbyid(id);
  }
  @Put('users/:id')
  async updatefulluser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: CreateUserDto,
  ) {
    return this.managerService.updateUser(id, updateData);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    return this.managerService.login(loginDto.email, loginDto.password);
  }
  @Post('sendmail')
  async sendMail(@Body() body: { email: string; username: string }) {
    return this.managerService.sendWelcomeEmail(body.email, body.username);
  }
}
