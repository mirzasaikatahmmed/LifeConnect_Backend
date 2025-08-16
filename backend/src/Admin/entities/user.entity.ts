import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { BloodRequest } from 'src/Manager/Entities/bloodrequest.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  bloodType: string;

  @Column({ default: 'donor' })
  userType: string; // 'donor', 'manager', 'admin'

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => BloodRequest, request => request.postedBy)
  bloodRequests: BloodRequest[];

  @Column()
  roleId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}