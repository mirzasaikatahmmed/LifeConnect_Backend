import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BloodRequest } from './bloodrequest.entity';

@Entity('Manager')
export class ManagerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ length: 11 })
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'manager' })
  role: string;

  @CreateDateColumn()
  joiningDate: Date;

  @OneToMany(() => BloodRequest, (bloodRequest) => bloodRequest.postedBy)
  bloodRequests: BloodRequest[];
}
