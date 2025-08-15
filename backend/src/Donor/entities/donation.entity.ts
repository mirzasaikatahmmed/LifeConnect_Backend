import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Donor } from './donor.entity';

@Entity()
export class Donation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Donor, (d) => d.donations, { onDelete: 'CASCADE' })
  donor: Donor;

  @Column({ type: 'varchar', length: 100 })
  centerName: string;

  @Column({ type: 'int', default: 1 })
  units: number;

  @CreateDateColumn()
  donatedAt: Date;
}
