// src/users/user.entity.ts
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum'; // <-- IMPORT BARU

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

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}