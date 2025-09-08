/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Admin/entities/user.entity';
import { BloodDonationHistory } from './entities/blooddonationhistory.entity';
import { BloodRequest } from 'src/Manager/Entities/bloodrequest.entity';
import { DonorRegisterDto } from './dto/donor-register.dto';
import { DonorLoginDto } from './dto/donor-login.dto';
import { DonorUpdateDto } from './dto/donor-update.dto';
import { DonorAvailabilityDto } from './dto/donor-availability.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailerService } from './mailer.service';

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(BloodDonationHistory)
    private bloodDonationHistoryRepo: Repository<BloodDonationHistory>,
    @InjectRepository(BloodRequest)
    private requestRepo: Repository<BloodRequest>,
    private mailer: MailerService,
  ) {}

  private signToken(payload: any) {
    const secret = process.env.JWT_SECRET || 'lifeconnect-secret-key';
    const expiresIn = process.env.JWT_EXPIRES || '7d';
    return jwt.sign(payload, secret, { expiresIn });
  }

  async register(dto: DonorRegisterDto) {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: passwordHash,
      name: dto.name,
      bloodType: dto.bloodType,
      phoneNumber: dto.phoneNumber,
      userType: 'donor',
      roleId: 3, // Assuming role ID 3 is for donors
    });
    const saved = await this.userRepo.save(user);

    // Send welcome email
     await this.mailer.sendWelcomeEmail(saved.email, saved.name);

    return { id: saved.id, email: saved.email };
  }

  async login(dto: DonorLoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, userType: 'donor' },
      // relations: ['role'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: 'donor',
    });
    return { access_token: token };
  }

  async me(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId, userType: 'donor' },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');

    const { password, ...safe } = user as any;
    return safe;
  }

  async updateProfile(userId: number, dto: DonorUpdateDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, userType: 'donor' },
    });
    if (!user) throw new NotFoundException('User not found');

    user.name = dto.name ?? user.name;
    user.bloodType = dto.bloodGroup ?? user.bloodType;
    user.phoneNumber = dto.phoneNumber ?? user.phoneNumber;

    const saved = await this.userRepo.save(user);
    const { password, ...safe } = saved as any;
    return safe;
  }

  async history(userId: number) {
    return this.bloodDonationHistoryRepo.find({
      where: { user: { id: userId } },
      order: { donatedAt: 'DESC' },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async availability(userId: number, dto: DonorAvailabilityDto) {
    // For now, we'll store availability in a separate field or handle it differently
    // since the User entity doesn't have isAvailable field
    return { success: true, message: 'Availability updated' };
  }

  async listActiveRequests() {
    return this.requestRepo.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  // Donation History CRUD operations (replacing History entity)
  async createHistory(userId: number, donationData: any) {
    const user = await this.userRepo.findOne({
      where: { id: userId, userType: 'donor' },
    });
    if (!user) throw new NotFoundException('User not found');

    const bloodDonation = this.bloodDonationHistoryRepo.create({
      user,
      centerName: donationData.centerName || 'Unknown Center',
      units: donationData.units || 1,
    });

    return await this.bloodDonationHistoryRepo.save(bloodDonation);
  }

  async getHistoryById(userId: number, donationId: number) {
    const bloodDonation = await this.bloodDonationHistoryRepo.findOne({
      where: { id: donationId, user: { id: userId } },
      relations: ['user'],
    });

    if (!bloodDonation)
      throw new NotFoundException('Blood donation record not found');

    return bloodDonation;
  }

  async updateHistory(userId: number, donationId: number, donationData: any) {
    const bloodDonation = await this.bloodDonationHistoryRepo.findOne({
      where: { id: donationId, user: { id: userId } },
    });

    if (!bloodDonation)
      throw new NotFoundException('Blood donation record not found');

    bloodDonation.centerName =
      donationData.centerName ?? bloodDonation.centerName;
    bloodDonation.units = donationData.units ?? bloodDonation.units;

    return await this.bloodDonationHistoryRepo.save(bloodDonation);
  }

  async patchHistory(userId: number, donationId: number, donationData: any) {
    const bloodDonation = await this.bloodDonationHistoryRepo.findOne({
      where: { id: donationId, user: { id: userId } },
    });

    if (!bloodDonation)
      throw new NotFoundException('Blood donation record not found');

    Object.keys(donationData).forEach((key) => {
      if (donationData[key] !== undefined && key !== 'donatedAt') {
        bloodDonation[key] = donationData[key];
      }
    });

    return await this.bloodDonationHistoryRepo.save(bloodDonation);
  }

  async deleteHistory(userId: number, donationId: number) {
    const bloodDonation = await this.bloodDonationHistoryRepo.findOne({
      where: { id: donationId, user: { id: userId } },
    });

    if (!bloodDonation)
      throw new NotFoundException('Blood donation record not found');

    await this.bloodDonationHistoryRepo.remove(bloodDonation);
    return {
      success: true,
      message: 'Blood donation record deleted successfully',
    };
  }

  //additional method to get all donor profiles
  async getAllDonorProfiles() {
    const donors = await this.userRepo.find({
      where: { userType: 'donor' },
      order: { id: 'ASC' }, // optional: order by ID
    });

    // Remove passwords before sending
    return donors.map(({ password, ...safe }) => safe);
  }
}
