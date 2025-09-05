import { User } from '../../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, ManyToOne, OneToMany, UpdateDateColumn } from 'typeorm';
import { PendaftaranStatus } from '../enums/pendaftaran-status.enum';
import { JadwalTes } from './jadwal-tes.entity';

@Entity('pendaftaran')
export class Pendaftaran {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: PendaftaranStatus,
        default: PendaftaranStatus.PENDING,
    })
    statusPembayaran: PendaftaranStatus;

    @Column()
    buktiPembayaranUrl: string;

    @Column({ nullable: true })
    tanggalVerifikasi: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relasi ke User (Santri)
    @OneToOne(() => User, (user) => user.pendaftaran)
    @JoinColumn()
    user: User;

    // Relasi ke User (Admin yang memverifikasi)
    @ManyToOne(() => User, { nullable: true })
    diverifikasiOleh: User;

    // Relasi ke JadwalTes
    @OneToMany(() => JadwalTes, (jadwal) => jadwal.pendaftaran)
    jadwalTes: JadwalTes[];
}