import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ManagerEntity } from './Manager.entity';
import { User } from 'src/Admin/entities/user.entity';

@Entity('bloodrequests')
export class BloodRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bloodType: string; // 'A+', 'B+', 'O+', 'AB+', etc.

    @Column()
    urgencyLevel: string; // 'low', 'medium', 'high', 'critical'

    @Column()
    hospitalName: string; // Which hospital needs blood

    @Column()
    hospitalAddress: string;

    @Column({ default: 'active' })
    status: string; // 'active', 'fulfilled', 'cancelled', 'expired'

    @Column({ type: 'timestamp' })
    neededBy: Date; // Deadline for blood needed

    @Column({ default: 1 })
    unitsNeeded: number; // How many units of blood needed

    // Many-to-One relationship with User
    @ManyToOne(() => ManagerEntity)
    @JoinColumn({ name: 'userId' })
    postedBy: ManagerEntity;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}