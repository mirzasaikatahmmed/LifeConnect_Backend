import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagerEntity } from './Entities/Manager.entity';
import { Repository } from 'typeorm';
import { CreateManagerDto } from './dto files/createaccount.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(ManagerEntity)
    private readonly managerRepository: Repository<ManagerEntity>,
  ) {}
  async createaccount(data: CreateManagerDto): Promise<ManagerEntity> {
    const existingUsername = await this.managerRepository.findOne({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists!!');
    }
    const existingEmail = await this.managerRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const manager = this.managerRepository.create({
      username: data.username,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      email: data.email,
    });
    const savedManager = await this.managerRepository.save(manager);

    console.log(`Manager ${savedManager.username} is created successfully!`);

    return savedManager;
  }
  async getAllManagers(): Promise<ManagerEntity[]>{
    return await this.managerRepository.find()
  }
  async getManagerById(id: number): Promise<ManagerEntity> {
  const manager = await this.managerRepository.findOneBy({  id });
  if (!manager) {
    throw new NotFoundException(`Manager with ID ${id} not found`);
  }
  return manager;
  }
  async updateManager(id: number, updateData: Partial<ManagerEntity>): Promise<ManagerEntity> {
  await this.managerRepository.update(id, updateData); 
  const updatedManager = await this.managerRepository.findOneBy({ id });
  if (!updatedManager) {
    throw new NotFoundException(`Manager with ID ${id} not found`);
  }
  return updatedManager;
}
}
