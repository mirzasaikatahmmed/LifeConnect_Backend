import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Donation } from './donation.entity';
import { Appointment } from './appointment.entity';

@Entity()
export class Donor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 200 })
    passwordHash: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name?: string;

    @Column({ type: 'varchar', length: 3, nullable: true }) // e.g., A+, O-
    bloodGroup?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phoneNumber?: string;

    @Column({ type: 'boolean', default: true })
    isAvailable: boolean;

    @Column({ type: 'date', nullable: true })
    lastDonationDate?: Date;

    @OneToMany(() => Donation, (d) => d.donor, { cascade: false })
    donations: Donation[];

    @OneToMany(() => Appointment, (a) => a.donor, { cascade: false })
    appointments: Appointment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
