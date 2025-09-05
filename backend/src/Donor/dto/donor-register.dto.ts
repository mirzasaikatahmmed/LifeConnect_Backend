/* eslint-disable prettier/prettier */
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class DonorRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  // @IsOptional()
  @IsString()
  bloodType?: string;

  // @IsOptional()
  @IsString()
  phoneNumber?: string;
}
