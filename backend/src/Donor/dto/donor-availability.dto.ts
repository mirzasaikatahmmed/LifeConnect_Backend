import { IsBoolean } from 'class-validator';

export class DonorAvailabilityDto {
    @IsBoolean()
    isAvailable: boolean;
}
