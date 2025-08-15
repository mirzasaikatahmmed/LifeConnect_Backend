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

    // Many-to-One relationship with Manager
    @ManyToOne(() => ManagerEntity)
    @JoinColumn({ name: 'managerId' })
    postedBy: ManagerEntity;

    @Column()
    managerId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}