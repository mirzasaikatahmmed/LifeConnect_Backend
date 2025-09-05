import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: 'info' })
  type: string; // 'info', 'warning', 'error', 'success'

  @Column({ default: 'active' })
  status: string; // 'active', 'inactive', 'expired'

  @Column({ nullable: true })
  targetAudience: string; // 'all', 'donors', 'managers', 'admins'

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  priority: number; // 0 = low, 1 = medium, 2 = high, 3 = critical

  @Column({ default: true })
  isSystemWide: boolean;

  // Foreign key to User (Admin who created the alert)
  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.alerts, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
