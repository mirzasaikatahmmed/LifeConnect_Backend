import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional, IsIn, IsBoolean, IsDateString } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserRoleDto {
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsIn(['info', 'warning', 'error', 'success'])
  type?: string = 'info';

  @IsOptional()
  @IsIn(['all', 'donors', 'managers', 'admins'])
  targetAudience?: string = 'all';

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2, 3])
  priority?: number = 0;

  @IsOptional()
  @IsBoolean()
  isSystemWide?: boolean = true;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsIn(['donor', 'manager', 'admin'])
  userType?: string = 'donor';

  @IsNumber()
  roleId: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['admin','manager','doner'])
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  permissions?: string[] = [];
}

export class SendAlertEmailDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsIn(['info', 'warning', 'error', 'success'])
  type?: string = 'info';

  @IsOptional()
  @IsIn(['all', 'donors', 'managers', 'admins'])
  targetAudience?: string = 'all';

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2, 3])
  priority?: number = 0;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean = true;
}
