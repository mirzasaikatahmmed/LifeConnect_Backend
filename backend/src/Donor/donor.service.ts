import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Donor } from './entities/donor.entity';
import { Donation } from './entities/donation.entity';
import { Appointment } from './entities/appointment.entity';
import { Request as BloodRequest } from './entities/request.entity';
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
    @InjectRepository(Donor) private donorRepo: Repository<Donor>,
    @InjectRepository(Donation) private donationRepo: Repository<Donation>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(BloodRequest)
    private requestRepo: Repository<BloodRequest>,
    private mailer: MailerService,
  ) {}

  private signToken(payload: any) {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const expiresIn = process.env.JWT_EXPIRES || '7d';
    return jwt.sign(payload, secret, { expiresIn });
  }

  async register(dto: DonorRegisterDto) {
    const exists = await this.donorRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const donor = this.donorRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      bloodGroup: dto.bloodGroup,
      phoneNumber: dto.phoneNumber,
    });
    const saved = await this.donorRepo.save(donor);

    // bonus: welcome email (non-blocking)
    this.mailer.send(
      saved.email,
      'Welcome to LifeConnect',
      `<p>Hello ${saved.name || 'Donor'}, welcome to LifeConnect!</p>`,
    );

    return { id: saved.id, email: saved.email };
  }

  async login(dto: DonorLoginDto) {
    const donor = await this.donorRepo.findOne({ where: { email: dto.email } });
    if (!donor) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, donor.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken({
      sub: donor.id,
      email: donor.email,
      role: 'donor',
    });
    return { access_token: token };
  }

  async me(donorId: number) {
    const donor = await this.donorRepo.findOne({ where: { id: donorId } });
    if (!donor) throw new NotFoundException('Donor not found');

    const { passwordHash, ...safe } = donor as any;
    return safe;
  }

  async updateProfile(donorId: number, dto: DonorUpdateDto) {
    const donor = await this.donorRepo.findOne({ where: { id: donorId } });
    if (!donor) throw new NotFoundException('Donor not found');

    if (dto.lastDonationDate)
      donor.lastDonationDate = new Date(dto.lastDonationDate);
    if (typeof dto.isAvailable === 'boolean')
      donor.isAvailable = dto.isAvailable;
    donor.name = dto.name ?? donor.name;
    donor.bloodGroup = dto.bloodGroup ?? donor.bloodGroup;
    donor.phoneNumber = dto.phoneNumber ?? donor.phoneNumber;

    const saved = await this.donorRepo.save(donor);
    const { passwordHash, ...safe } = saved as any;
    return safe;
  }

  async history(donorId: number) {
    return this.donationRepo.find({
      where: { donor: { id: donorId } },
      order: { donatedAt: 'DESC' },
    });
  }

  async availability(donorId: number, dto: DonorAvailabilityDto) {
    await this.donorRepo.update(
      { id: donorId },
      { isAvailable: dto.isAvailable },
    );
    return { success: true };
  }

  async upcomingAppointments(donorId: number) {
    const now = new Date();
    return this.appointmentRepo.find({
      where: {
        donor: { id: donorId },
        scheduledAt: LessThan(new Date(now.getTime() + 365 * 24 * 3600 * 1000)),
      },
      order: { scheduledAt: 'ASC' },
    });
  }

  async listActiveRequests() {
    return this.requestRepo.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }
}
