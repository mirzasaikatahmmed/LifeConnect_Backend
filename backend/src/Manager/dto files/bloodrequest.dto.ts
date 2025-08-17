// blood-request.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CreateBloodRequestDto {
  @IsString()
  @IsNotEmpty()
  bloodType: string; // 'A+', 'B+', 'O+', 'AB+', etc.

  @IsString()
  @IsNotEmpty()
  urgencyLevel: string; // 'low', 'medium', 'high', 'critical'

  @IsString()
  @IsNotEmpty()
  hospitalName: string;

  @IsString()
  @IsNotEmpty()
  hospitalAddress: string;

  @IsDate()
  @IsNotEmpty()
  neededBy: Date;

  @IsNumber()
  @IsOptional()
  unitsNeeded?: number = 1;

  // @IsNumber()
  // @IsNotEmpty()
  // managerId: number; // ID of the manager posting this request
}

export class UpdateBloodRequestDto {
  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsOptional()
  urgencyLevel?: string;

  @IsString()
  @IsOptional()
  hospitalName?: string;

  @IsString()
  @IsOptional()
  hospitalAddress?: string;

  @IsDate()
  @IsOptional()
  neededBy?: Date;

  @IsNumber()
  @IsOptional()
  unitsNeeded?: number;

  @IsString()
  @IsOptional()
  status?: string; // 'active', 'fulfilled', 'cancelled', 'expired'
}
