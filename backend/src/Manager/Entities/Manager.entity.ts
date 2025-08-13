import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
