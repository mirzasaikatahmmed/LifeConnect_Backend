import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../../Admin/entities/user.entity';

@Entity('blood_donation_history')
export class BloodDonationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.bloodDonationHistory, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  centerName: string;

  @Column({ type: 'int', default: 1 })
  units: number;

  @CreateDateColumn()
  donatedAt: Date;
}
