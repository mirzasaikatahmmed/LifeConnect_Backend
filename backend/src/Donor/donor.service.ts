// src/Donor/donor.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Admin/entities/user.entity';
import { DonorRegisterDto } from './dto/donor-register.dto';
import { DonorLoginDto } from './dto/donor-login.dto';
import { DonorUpdateDto } from './dto/donor-update.dto';
import { DonorAvailabilityDto } from './dto/donor-availability.dto';
import { BloodDonationHistory } from 'src/Donor/entities/blooddonationhistory.entity';
import { BloodRequest } from 'src/Manager/Entities/bloodrequest.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BloodDonationHistory)
    private readonly historyRepository: Repository<BloodDonationHistory>,
    @InjectRepository(BloodRequest)
    private readonly bloodRequestRepository: Repository<BloodRequest>,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: DonorRegisterDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      userType: 'donor',
      roleId: 2, // Assuming roleId 2 is for 'donor'
    });
    return this.userRepository.save(newUser);
  }

  async login(dto: DonorLoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials.');
    }
    const payload = { sub: user.id, email: user.email, userType: user.userType };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async me(userId: number): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, dto: DonorUpdateDto): Promise<User> {
    const user = await this.userRepository.preload({ id: userId, ...dto });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.userRepository.save(user);
  }

  async history(userId: number): Promise<BloodDonationHistory[]> {
    return this.historyRepository.find({
      where: { user: { id: userId } },
      relations: ['bloodRequest'],
    });
  }

  async availability(userId: number, dto: DonorAvailabilityDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    // Logic to handle donor availability
    return { message: 'Availability status updated successfully.' };
  }

  async listActiveRequests(): Promise<BloodRequest[]> {
    return this.bloodRequestRepository.find({
      where: { status: 'active' },
      relations: ['postedBy'],
    });
  }

  // FIX: Corrected the return type to a single object
  async createHistory(userId: number, historyData: any): Promise<BloodDonationHistory> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const newHistory = this.historyRepository.create({
      ...historyData,
      user: user,
    });
    const saved = await this.historyRepository.save(newHistory);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async getHistoryById(userId: number, id: number): Promise<BloodDonationHistory> {
    const history = await this.historyRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!history) {
      throw new NotFoundException('Donation history not found.');
    }
    return history;
  }

  async updateHistory(userId: number, id: number, historyData: any): Promise<BloodDonationHistory> {
    const history = await this.historyRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!history) {
      throw new NotFoundException('Donation history not found.');
    }
    this.historyRepository.merge(history, historyData);
    return this.historyRepository.save(history);
  }

  async patchHistory(userId: number, id: number, historyData: any): Promise<BloodDonationHistory> {
    const history = await this.historyRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!history) {
      throw new NotFoundException('Donation history not found.');
    }
    this.historyRepository.merge(history, historyData);
    return this.historyRepository.save(history);
  }

  async deleteHistory(userId: number, id: number): Promise<{ message: string }> {
    const result = await this.historyRepository.delete({ id: id, user: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException('Donation history not found or not owned by user.');
    }
    return { message: 'Donation history deleted successfully.' };
  }

  async getAllDonorProfiles(): Promise<User[]> {
    return this.userRepository.find({
      where: { userType: 'donor' },
      select: ['id', 'name', 'email', 'phoneNumber', 'bloodType', 'isVerified', 'isActive'],
    });
  }
}