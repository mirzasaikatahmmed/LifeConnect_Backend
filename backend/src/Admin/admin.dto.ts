import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsStrongPassword,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class UpdateUserRoleDto {
  @IsNumber({}, { message: 'Role ID must be a number' })
  @IsNotEmpty({ message: 'Role ID is required' })
  @IsInt({ message: 'Role ID must be an integer' })
  @Min(1, { message: 'Role ID must be greater than 0' })
  roleId: number;
}

export class CreateAlertDto {
  @IsNotEmpty({ message: 'Alert title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @IsNotEmpty({ message: 'Alert message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  message: string;

  @IsOptional()
  @IsIn(['info', 'warning', 'error', 'success'], {
    message: 'Type must be one of: info, warning, error, success',
  })
  type?: string = 'info';

  @IsOptional()
  @IsIn(['all', 'donors', 'managers', 'admins'], {
    message: 'Target audience must be one of: all, donors, managers, admins',
  })
  targetAudience?: string = 'all';

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid date string' })
  expiresAt?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a number' })
  @IsInt({ message: 'Priority must be an integer' })
  @IsIn([0, 1, 2, 3], {
    message: 'Priority must be 0 (low), 1 (normal), 2 (high), or 3 (critical)',
  })
  priority?: number = 0;

  @IsOptional()
  @IsBoolean({ message: 'isSystemWide must be a boolean' })
  isSystemWide?: boolean = true;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @IsOptional()
  @IsString({ message: 'Blood type must be a string' })
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    message: 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
  })
  bloodType?: string;

  @IsOptional()
  @IsIn(['donor', 'manager', 'admin'], {
    message: 'User type must be one of: donor, manager, admin',
  })
  userType?: string = 'donor';

  @IsNumber({}, { message: 'Role ID must be a number' })
  @IsInt({ message: 'Role ID must be an integer' })
  @Min(1, { message: 'Role ID must be greater than 0' })
  roleId: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'Blood type must be a string' })
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    message: 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
  })
  bloodType?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isVerified must be a boolean' })
  isVerified?: boolean;
}

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Role name is required' })
  @IsString({ message: 'Role name must be a string' })
  @IsIn(['admin', 'manager', 'donor'], {
    message: 'Role name must be one of: admin, manager, donor',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  permissions?: string[] = [];
}

export class SendAlertEmailDto {
  @IsNotEmpty({ message: 'Alert title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @IsNotEmpty({ message: 'Alert message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  message: string;

  @IsOptional()
  @IsIn(['info', 'warning', 'error', 'success'], {
    message: 'Type must be one of: info, warning, error, success',
  })
  type?: string = 'info';

  @IsOptional()
  @IsIn(['all', 'donors', 'managers', 'admins'], {
    message: 'Target audience must be one of: all, donors, managers, admins',
  })
  targetAudience?: string = 'all';

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid date string' })
  expiresAt?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a number' })
  @IsInt({ message: 'Priority must be an integer' })
  @IsIn([0, 1, 2, 3], {
    message: 'Priority must be 0 (low), 1 (normal), 2 (high), or 3 (critical)',
  })
  priority?: number = 0;

  @IsOptional()
  @IsBoolean({ message: 'sendEmail must be a boolean' })
  sendEmail?: boolean = true;
}

export class TestEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
