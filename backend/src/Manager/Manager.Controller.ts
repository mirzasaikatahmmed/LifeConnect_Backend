import {
  Body,
  Controller,
  Get,
  Param,
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
}
