import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagerEntity } from './Entities/Manager.entity';
import { Repository } from 'typeorm';
import { CreateManagerDto } from './dto files/manager.dto';
import * as bcrypt from 'bcrypt';
import { CreateRoleDto, CreateUserDto } from 'src/Admin/admin.dto';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';
@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(ManagerEntity)
    private readonly managerRepository: Repository<ManagerEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
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
  

  async createManagerUser(data: CreateUserDto): Promise<User> {
    const role = await this.roleRepository.findOneBy({ id: data.roleId });
    console.log('Role found:', role);
    if (!role) {
      throw new NotFoundException(`Role with ID ${data.roleId} not found`);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      // userType: 'manager', 
    });
    return await this.userRepository.save(user);
  }
    async createRole(data: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }
   async deleteuserbyid(id: number): Promise<{ messege: string }>{
     const findid = await this.userRepository.findOneBy({ id })
     if (!findid) {
       throw new NotFoundException("User not found");
     }
     const result = await this.userRepository.delete(id);
     return {messege:"User deleted successfully."}
  }
  //PuT request function
  async updateUser(id: number, updateData: CreateUserDto): Promise<User> {
  const user = await this.userRepository.findOneBy({ id });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  Object.assign(user, updateData);
  return this.userRepository.save(user);
}
}
