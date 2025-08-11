import { ConflictException, Injectable } from '@nestjs/common';
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
}
