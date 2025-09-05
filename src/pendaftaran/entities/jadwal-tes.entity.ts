import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pendaftaran } from './pendaftaran.entity';
import { TesJenis } from '../enums/tes-jenis.enum';
import { TesMetode } from '../enums/tes-metode.enum';

@Entity('jadwal_tes')
export class JadwalTes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: TesJenis,
    })
    jenisTes: TesJenis;

    @Column({
        type: 'enum',
        enum: TesMetode,
    })
    metode: TesMetode;

    @Column({ type: 'datetime' })
    tanggalWaktu: Date;

    // Relasi ke Pendaftaran
    @ManyToOne(() => Pendaftaran, (pendaftaran) => pendaftaran.jadwalTes)
    pendaftaran: Pendaftaran;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}