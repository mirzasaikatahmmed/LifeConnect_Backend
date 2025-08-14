import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Request {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 3 }) // needed blood group
    bloodGroup: string;

    @Column({ type: 'varchar', length: 160 })
    location: string;

    @Column({ type: 'int', default: 1 })
    units: number;

    @Column({ type: 'varchar', length: 20, default: 'active' }) // active|fulfilled|cancelled
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}
