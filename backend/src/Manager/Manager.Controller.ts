import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ManagerService } from './Manager.Service';
import { CreateManagerDto } from './dto files/createaccount.dto';
import { ManagerEntity } from './Entities/Manager.entity';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}
  @Post('createaccount')
  @UsePipes(new ValidationPipe())
  createaccount(@Body() data: CreateManagerDto): Promise<ManagerEntity> {
    return this.managerService.createaccount(data);
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

}
