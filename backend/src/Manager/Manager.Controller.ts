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
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ManagerService } from './Manager.Service';
import { CreateManagerDto } from './dto files/manager.dto';
import { ManagerEntity } from './Entities/Manager.entity';
import {
  CreateRoleDto,
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
} from 'src/Admin/admin.dto';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';
import { ManagerGuard } from './guards/manager.guard';
import { JwtGuard } from 'src/Admin/guards/jwt.guard';
import {
  CreateBloodRequestDto,
  UpdateBloodRequestDto,
} from './dto files/bloodrequest.dto';
import { BloodRequest } from './Entities/bloodrequest.entity';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) { }

  @Post('createaccount')
  @UsePipes(new ValidationPipe())
  createaccount(@Body() data: CreateManagerDto): Promise<ManagerEntity> {
    return this.managerService.createaccount(data);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    return this.managerService.login(loginDto.email, loginDto.password);
  }

  @Get(':id')
  @UseGuards(ManagerGuard)
  getManagerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ManagerEntity> {
    return this.managerService.getManagerById(id);
  }

  @Patch(':id')
  @UseGuards(ManagerGuard)
  async updateManager(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<ManagerEntity>,
  ): Promise<ManagerEntity> {
    // return this.managerService.updateManager(id, updateData);
    const update = await this.managerService.updateManager(id, updateData);
    await this.managerService.sendUpdateEmail(update.email, update.name);
    return update;
  }

  @Get('allmanagers')
  @UseGuards(ManagerGuard)
  getAllManagers() {
    return this.managerService.getAllManagers();
  }
  // @Post('createaccount')
  // @UsePipes(new ValidationPipe())
  // async createaccount(@Body() data: CreateManagerDto): Promise<ManagerEntity> {
  //   const newManager = await this.managerService.createaccount(data);
  //   await this.managerService.sendWelcomeEmail(newManager.email, newManager.name);
  //   return newManager;
  // }
  @Post('createmanagerUser')
  @UsePipes(new ValidationPipe())
  createManagerUser(@Body() data: CreateUserDto): Promise<User> {
    return this.managerService.createManagerUser(data);
  }

  @Post('createrole')
  @UsePipes(new ValidationPipe())
  createRole(@Body() data: CreateRoleDto): Promise<Role> {
    return this.managerService.createRole(data);
  }

  @Post('manageruserlogin')
  @UsePipes(new ValidationPipe())
  async manageruserlogin(@Body() loginDto: LoginDto) {
    return this.managerService.manageruserlogin(
      loginDto.email,
      loginDto.password,
    );
  }

  @Delete('users/:id')
  @UseGuards(ManagerGuard)
  deleteuser(@Param('id', ParseIntPipe) id: number, @Req() req): any {
    return this.managerService.deleteUserById(id, req.user);
  }

  @Put('users/:id')
  @UseGuards(ManagerGuard)
  async updatefulluser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: CreateUserDto,
    @Req() req,
  ) {
    const updateduserinfo = await this.managerService.updateUser(
      id,
      updateData,
      req.user,
    );
    await this.managerService.sendUpdateEmail(
      updateduserinfo.email,
      updateduserinfo.name,
    );
    return updateduserinfo;
  }

  @Patch('users/:id')
  @UseGuards(ManagerGuard)
  async updateuserInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserDto,
    @Req() req,
  ) {
    return await this.managerService.updateUserInfo(id, updateData, req.user);
    // await this.managerService.sendUpdateEmail(updateduserinfo.email,updateduserinfo.name)
  }
  @Get('users/managers')
  @UseGuards(ManagerGuard)
  async getAlluserManagers() {
    return this.managerService.getAlluserManagers();
  }

  @Post('sendmail')
  async sendMail(@Body() body: { email: string; username: string }) {
    return this.managerService.sendWelcomeEmail(body.email, body.username);
  }

  @Post('createbloodrequest')
  @UseGuards(ManagerGuard)
  createrequest(
    @Body() createdata: CreateBloodRequestDto,
    @Req() req,
  ): Promise<{ message: string }> {
    const userId = req.user.id || req.user.sub;
    return this.managerService.createbloodrequest(userId, createdata);
  }

  @Patch('updatebloodrequest/:id')
  @UseGuards(ManagerGuard)
  updateBloodRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Body() updateData: UpdateBloodRequestDto,
    @Req() req,
  ): Promise<{ message: string; data?: BloodRequest | null }> {
    const userId = req.user.id || req.user.sub;
    return this.managerService.updateBloodRequest(
      requestId,
      updateData,
      userId,
    );
  }

  @Delete('deletebloodrequest/:id')
  @UseGuards(ManagerGuard)
  deleteBloodRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Req() req,
  ): Promise<{ message: string }> {
    const userId = req.user.id || req.user.sub;
    return this.managerService.deleteBloodRequest(requestId, userId);
  }
  //request from user table below

  @Get('request/allrequests')
  @UseGuards(ManagerGuard)
  getallrequestbyid(@Req() req): Promise<BloodRequest[]> {
    const userId = req.user.id || req.user.sub;
    return this.managerService.getallrequest(userId)
  }

}
