import { User } from '../../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Jurusan } from '../enums/jurusan.enum';

@Entity('biodata')
export class Biodata {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    namaLengkap: string;

    @Column({ unique: true })
    nisn: string;

    @Column()
    sekolahAsal: string;

    @Column('text')
    alamat: string;

    @Column()
    tempatLahir: string;

    @Column({ type: 'date' })
    tanggalLahir: Date;

    @Column({ default: '0' })
    jumlahHafalanJuz: string;

    @Column({
        type: 'enum',
        enum: Jurusan,
    })
    jurusan: Jurusan;

    @Column({ type: 'text', default: '-' })
    ilmuIT: string;

    // Relasi One-to-One ke User
    @OneToOne(() => User, (user) => user.biodata)
    @JoinColumn()
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}