import { Module } from '@nestjs/common';
import { ManagerController } from './Manager.Controller';
import { ManagerService } from './Manager.Service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerEntity } from './Entities/Manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManagerEntity])],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule {}
