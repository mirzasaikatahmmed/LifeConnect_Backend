import { Module } from '@nestjs/common';
import { ManagerController } from './Manager.Controller';
import { ManagerService } from './Manager.Service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerEntity } from './Entities/Manager.entity';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManagerEntity,User, Role])],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule {}
