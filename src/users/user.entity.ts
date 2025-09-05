// src/users/user.entity.ts
import { BeforeInsert, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum'; // <-- IMPORT BARU
import { Biodata } from '../pendaftaran/entities/biodata.entity';
import { Pendaftaran } from '../pendaftaran/entities/pendaftaran.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    namaSantri: string;

    @Column()
    password: string;

    @Column()
    nomorHandphone: string;

    @Column()
    infoPendaftaran: string;

    // --- KOLOM BARU UNTUK ROLE ---
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.SANTRI, // <-- PENTING!
    })
    role: UserRole;
    // -----------------------------

    @OneToOne(() => Biodata, (biodata) => biodata.user)
    biodata: Biodata;

    @OneToOne(() => Pendaftaran, (pendaftaran) => pendaftaran.user)
    pendaftaran: Pendaftaran;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}