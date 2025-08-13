import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';

export class CreateManagerDto {
  @IsNotEmpty({ message: 'Username is required' })
  @Matches(/^[A-Za-z]+$/, {
    message:
      'Username must contain only alphabets, no numbers or special characters',
  })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only numbers' })
  phoneNumber: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}
export class LoginManagerDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}


export class UpdateManagerDto {
  @IsOptional()
  @Matches(/^[A-Za-z]+$/, {
    message: 'Username must contain only alphabets, no numbers or special characters',
  })
  username?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only numbers' })
  phoneNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;
}
