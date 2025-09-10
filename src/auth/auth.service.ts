// src/auth/auth.service.ts
import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'; // <-- IMPORT BARU
import { LoginDto } from './dto/login.dto'; // <-- IMPORT BARU
import { JwtService } from '@nestjs/jwt';
import { LoginResponse, PendaftaranStatusInfo } from './interfaces/login-response.interface';
import { UserRole } from '../users/user-role.enum'; // <-- Import UserRole
import { Pendaftaran } from '../pendaftaran/entities/pendaftaran.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Pendaftaran)
        private pendaftaranRepository: Repository<Pendaftaran>,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;

        const user = await this.usersRepository.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
            };
            const accessToken = this.jwtService.sign(payload);

            const { password, ...userData } = user;

            // --- LOGIKA TAMBAHAN UNTUK SANTRI ---
            let pendaftaranStatus: PendaftaranStatusInfo | null = null;

            if (user.role === UserRole.SANTRI) {
                const pendaftaran = await this.pendaftaranRepository.findOne({
                    where: { user: { id: user.id } },
                    relations: ['jadwalTes'], // Kita butuh relasi ini untuk mengecek jadwal
                });

                if (pendaftaran) {
                    pendaftaranStatus = {
                        sudahMendaftar: true,
                        statusPembayaran: pendaftaran.statusPembayaran,
                        sudahMenjadwalkanTes: pendaftaran.jadwalTes.length > 0,
                    };
                } else {
                    pendaftaranStatus = {
                        sudahMendaftar: false,
                        statusPembayaran: null,
                        sudahMenjadwalkanTes: false,
                    };
                }
            }
            // --- AKHIR LOGIKA TAMBAHAN ---

            return {
                message: 'berhasil login',
                data: {
                    user: userData,
                    accessToken: accessToken,
                    pendaftaranStatus: pendaftaranStatus, // <-- Tambahkan ke response
                },
            };
        } else {
            throw new UnauthorizedException('Kredensial tidak valid. Silakan cek email dan password Anda.');
        }
    }

    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        const { email, namaSantri, password, konfirmasiPassword, nomorHandphone, infoPendaftaran } = registerDto;

        // 1. Validasi konfirmasi password (meskipun sudah ada di DTO, ini lapisan tambahan)
        if (password !== konfirmasiPassword) {
            throw new BadRequestException('Password dan konfirmasi password tidak cocok.');
        }

        // 2. Cek apakah email sudah terdaftar
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email sudah terdaftar.');
        }

        // 3. Buat user baru
        // Password akan di-hash secara otomatis oleh hook @BeforeInsert di User entity
        const newUser = this.usersRepository.create({
            email,
            namaSantri,
            password,
            nomorHandphone,
            infoPendaftaran,
        });

        // 4. Simpan user ke database
        await this.usersRepository.save(newUser);

        return { message: 'Registrasi berhasil. Silakan login.' };
    }
}