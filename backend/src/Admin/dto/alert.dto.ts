import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  @IsIn(['info', 'warning', 'error', 'success'])
  type?: string = 'info';

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'archived'])
  status?: string = 'active';

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  isSystemWide?: boolean = true;

  @IsOptional()
  @IsString()
  @IsIn(['all', 'donors', 'managers', 'admins'])
  targetAudience?: string = 'all';

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2, 3])
  priority?: number = 0;
}

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  @IsIn(['info', 'warning', 'error', 'success'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'archived', 'expired'])
  status?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  isSystemWide?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['all', 'donors', 'managers', 'admins'])
  targetAudience?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2, 3])
  priority?: number;
}

export class AlertResponseDto {
  id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  expiresAt?: Date;
  isSystemWide: boolean;
  targetAudience?: string;
  priority: number;
  userId?: number;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
