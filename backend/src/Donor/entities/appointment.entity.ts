import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Donor } from './donor.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Donor, (d) => d.appointments, { onDelete: 'CASCADE' })
  donor: Donor;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'varchar', length: 120 })
  location: string;

  @Column({ type: 'varchar', length: 20, default: 'upcoming' }) // upcoming|completed|cancelled
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
