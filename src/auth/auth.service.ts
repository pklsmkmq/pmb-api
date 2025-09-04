// src/auth/auth.service.ts
import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'; // <-- IMPORT BARU
import { LoginDto } from './dto/login.dto'; // <-- IMPORT BARU
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const { email, password } = loginDto;

        // 1. Cari user berdasarkan email
        const user = await this.usersRepository.findOne({ where: { email } });

        // 2. Jika user ditemukan DAN password-nya cocok
        if (user && (await bcrypt.compare(password, user.password))) {
            // 3. Buat payload untuk JWT
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role // <-- Sertakan role dalam token!
            };

            // 4. Buat JWT Token
            const accessToken = this.jwtService.sign(payload);

            // 5. Kembalikan token
            return { accessToken };
        } else {
            // 6. Jika user tidak ditemukan ATAU password salah
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