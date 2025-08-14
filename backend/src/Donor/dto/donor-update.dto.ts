import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class DonorUpdateDto {
    @IsOptional() @IsString()
    name?: string;

    @IsOptional() @IsString()
    bloodGroup?: string;

    @IsOptional() @IsString()
    phoneNumber?: string;

    @IsOptional() @IsBoolean()
    isAvailable?: boolean;

    @IsOptional() @IsDateString()
    lastDonationDate?: string; // ISO (YYYY-MM-DD)
}
