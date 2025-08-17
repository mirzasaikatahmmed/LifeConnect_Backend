import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagerEntity } from './Entities/Manager.entity';
import { Repository } from 'typeorm';
import { CreateManagerDto } from './dto files/manager.dto';
import * as bcrypt from 'bcrypt';
import {
  CreateRoleDto,
  CreateUserDto,
  UpdateUserDto,
} from 'src/Admin/admin.dto';
import { User } from 'src/Admin/entities/user.entity';
import { Role } from 'src/Admin/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import {
  CreateBloodRequestDto,
  UpdateBloodRequestDto,
} from './dto files/bloodrequest.dto';
import { BloodRequest } from './Entities/bloodrequest.entity';
@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(ManagerEntity)
    private readonly managerRepository: Repository<ManagerEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(BloodRequest)
    private requestRepository: Repository<BloodRequest>,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async createaccount(data: CreateManagerDto): Promise<ManagerEntity> {
    const existingUsername = await this.managerRepository.findOne({
      where: { name: data.username },
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
      name: data.username,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      email: data.email,
    });
    const savedManager = await this.managerRepository.save(manager);

    console.log(`Manager ${savedManager.name} is created successfully!`);

    return savedManager;
  }

  async getAllManagers(): Promise<ManagerEntity[]> {
    return await this.managerRepository.find();
  }

  async getManagerById(id: number): Promise<ManagerEntity> {
    const manager = await this.managerRepository.findOneBy({ id });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${id} not found`);
    }
    return manager;
  }
  // async updateManager(id: number, updateData: Partial<ManagerEntity>): Promise<ManagerEntity> {
  //   await this.managerRepository.update(id, updateData);
  //   const updatedManager = await this.managerRepository.findOneBy({ id });
  //   if (!updatedManager) {
  //     throw new NotFoundException(`Manager with ID ${id} not found`);
  //   }
  //   return updatedManager;
  // }
  async updateManager(
    id: number,
    updateData: Partial<ManagerEntity>,
  ): Promise<ManagerEntity> {
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    await this.managerRepository.update(id, updateData);
    const updatedManager = await this.managerRepository.findOneBy({ id });
    if (!updatedManager) {
      throw new NotFoundException(`Manager with ID ${id} not found`);
    }
    return updatedManager;
  }

  async createManagerUser(data: CreateUserDto): Promise<User> {
    const role = await this.roleRepository.findOne({
      where: { id: data.roleId, isActive: true },
    });
    console.log('Role found:', role);
    if (!role) {
      throw new NotFoundException(
        `Role with ID ${data.roleId} not found or inactive`,
      );
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      // userType: 'manager',
    });
    const savedUser = await this.userRepository.save(user);

    // Return user with role information populated
    const userWithRole = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });
    if (!userWithRole) {
      throw new NotFoundException('Failed to retrieve created user');
    }
    return userWithRole;
  }

  async createRole(data: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }

  // async deleteuserbyid(id: number): Promise<{ messege: string }> {
  //   const findid = await this.userRepository.findOneBy({ id })
  //   if (!findid) {
  //     throw new NotFoundException("User not found");
  //   }
  //   const result = await this.userRepository.delete(id);
  //   return { messege: "User deleted successfully." }
  // }
  //PuT request function(privious updateUser)
  // async updateUser(id: number, updateData: CreateUserDto): Promise<User> {
  //   const user = await this.userRepository.findOneBy({ id });
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }
  //   if (updateData.password) {
  //     updateData.password = await bcrypt.hash(updateData.password, 10);
  //   }
  //   Object.assign(user, updateData);
  //   return this.userRepository.save(user);
  // }

  async deleteUserById(
    id: number,
    currentUser: any,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.role === 'manager') {
      if (currentUser.sub == user.id) {
      } else if (currentUser.sub !== user.id) {
        throw new UnauthorizedException(
          'Managers can only delete their own account',
        );
      }
    } else if (currentUser.role === 'admin') {
    } else {
      throw new UnauthorizedException('Unauthorized to delete user');
    }

    await this.userRepository.delete(id);
    return { message: 'User deleted successfully.' };
  }

  async updateUser(
    id: number,
    updateData: CreateUserDto,
    currentUser: any,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (currentUser.role === 'manager') {
      if (currentUser.sub === user.id) {
      } else if (user.userType !== 'donor') {
        throw new UnauthorizedException(
          'Managers cannot update other managers or admins',
        );
      }
    } else if (currentUser.role === 'admin') {
    } else if (currentUser.role === 'donor') {
      if (currentUser.sub !== user.id) {
        throw new UnauthorizedException(
          'Donors can only update their own data',
        );
      }
    } else {
      throw new UnauthorizedException('Unauthorized');
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async updateUserInfo(
    id: number,
    updateData: Partial<UpdateUserDto>,
    currentUser: any,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Role-based permission checks
    if (currentUser.role === 'manager') {
      if (currentUser.sub !== user.id && user.userType !== 'donor') {
        throw new UnauthorizedException(
          'Managers can only update donors or their own profile',
        );
      }
    } else if (currentUser.role === 'admin') {
      // Admin can update anyone — no restriction here
    } else if (currentUser.role === 'donor') {
      if (currentUser.sub !== user.id) {
        throw new UnauthorizedException(
          'Donors can only update their own data',
        );
      }
    } else {
      throw new UnauthorizedException('Unauthorized');
    }

    // Merge updated fields
    Object.assign(user, updateData);

    return this.userRepository.save(user);
  }

  async getAlluserManagers(): Promise<User[]> {
    return this.userRepository.find({
      where: { userType: 'manager' },
      relations: ['role'], // role details include করতে চাইলে
    });
  }

  async login(email: string, password: string) {
    const manager = await this.managerRepository.findOne({
      where: { email },
    });

    if (!manager) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: manager.id,
      id: manager.id,
      email: manager.email,
      username: manager.name,
      role: manager.role, // 'manager'
      userType: 'manager',
    };

    return {
      access_token: this.jwtService.sign(payload),
      manager: {
        id: manager.id,
        username: manager.name,
        email: manager.email,
        role: manager.role,
      },
    };
  }

  async sendWelcomeEmail(toEmail: string, username: string) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Welcome to LifeConnect!',
      text: `Hello ${username}, your account has been created successfully.`,
      html: `<h3>Hello ${username}</h3><p>Your account has been created successfully.</p>`,
    });
    return { message: 'Email sent successfully' };
  }

  async sendUpdateEmail(toEmail: string, username: string) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Your LifeConnect Account Has Been Updated',
      text: `Hello ${username}, your account details have been updated successfully.`,
      html: `<h3>Hello ${username}</h3><p>Your account details have been updated successfully.</p>`,
    });
    return { message: 'Update email sent successfully' };
  }

  // async createbloodrequest(createdata: CreateBloodRequestDto): Promise<{ message: string, data?: BloodRequest }> {
  //   const post = await this.requestRepository.save(createdata);
  //   return { message: "Blood request Posted", data: post }
  // }
  async createbloodrequest(
    userId: number,
    createdata: CreateBloodRequestDto,
  ): Promise<{ message: string; data?: BloodRequest }> {
    const bloodRequestData = {
      ...createdata,
      userId,
      // neededBy: new Date(createdata.neededBy) // Convert string to Date
    };

    const post = await this.requestRepository.save(bloodRequestData);
    return { message: 'Blood request Posted', data: post };
  }

  async updateBloodRequest(
    requestId: number,
    updateData: UpdateBloodRequestDto,
    userId: number,
  ): Promise<{ message: string; data?: BloodRequest | null }> {
    const existingRequest = await this.requestRepository.findOne({
      where: { id: requestId, userId },
    });
    if (!existingRequest) {
      throw new NotFoundException(
        `Blood request with ID ${requestId} not found or you don't have permission to update it`,
      );
    }
    await this.requestRepository.update(requestId, updateData);
    const updatedRequest = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['postedBy'],
    });
    return {
      message: 'Blood request updated successfully',
      data: updatedRequest,
    };
  }

  async deleteBloodRequest(
    requestId: number,
    userId: number,
  ): Promise<{ message: string }> {
    const existingRequest = await this.requestRepository.findOne({
      where: { id: requestId, userId },
    });
    if (!existingRequest) {
      throw new NotFoundException(
        `Blood request with ID ${requestId} not found or you don't have permission to delete it`,
      );
    }
    await this.requestRepository.delete(requestId);
    console.log(`Blood request ID ${requestId} deleted by user ${userId}`);
    return {
      message: 'Blood request deleted successfully',
    };
  }

  async manageruserlogin(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role.name !== 'manager') {
      throw new UnauthorizedException('Access denied: Not a manager');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      userType: user.userType,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    };
  }
}
