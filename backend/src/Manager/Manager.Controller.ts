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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ManagerService } from './Manager.Service';
import { CreateManagerDto } from './dto files/manager.dto';
import { ManagerEntity } from './Entities/Manager.entity';
import { CreateRoleDto, CreateUserDto } from 'src/Admin/admin.dto';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}
  @Post('createaccount')
  @UsePipes(new ValidationPipe())
  createaccount(@Body() data: CreateManagerDto): Promise<ManagerEntity> {
    return this.managerService.createaccount(data);
  }
  @Post('createmanagerUser')
  @UsePipes(new ValidationPipe())
  createManagerUser(@Body() data: CreateUserDto): Promise<User> {
    return this.managerService.createManagerUser(data);
  }

  @Get('allmanagers')
  getAllManagers() {
  return this.managerService.getAllManagers();
  }
  @Get(':id')
  getManagerById(@Param('id', ParseIntPipe) id: number): Promise<ManagerEntity> {
    return this.managerService.getManagerById(id);
  }
  @Patch(':id')
  updateManager(
    @Param('id',ParseIntPipe) id: number,
    @Body() updateData: Partial<ManagerEntity>
  ): Promise<ManagerEntity> {
    return this.managerService.updateManager(id, updateData);
  }

  @Post('createrole')
  @UsePipes(new ValidationPipe())
  createRole(@Body() data: CreateRoleDto): Promise<Role> {
    return this.managerService.createRole(data);
  }
  @Delete('users/:id')
  deleteuser(@Param('id', ParseIntPipe) id: number): any{
    return this.managerService.deleteuserbyid(id);
  }
@Put('users/:id')
async updatefulluser(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateData: CreateUserDto, 
) {
  return this.managerService.updateUser(id, updateData);
}
}
