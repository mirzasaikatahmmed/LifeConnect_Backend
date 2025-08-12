import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './admin.dto';

@Injectable()
export class AdminService {
  private readonly admins = [];

  create(admin: CreateAdminDto) {
    this.admins.push(admin);
    return admin;
  }

  findAll() {
    return this.admins;
  }
}
