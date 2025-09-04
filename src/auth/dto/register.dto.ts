// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Email tidak boleh kosong' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email: string;

    @IsNotEmpty({ message: 'Nama santri tidak boleh kosong' })
    @IsString()
    namaSantri: string;

    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(8, { message: 'Password minimal harus 8 karakter' })
    password: string;

    // Hapus decorator @Matches dari sini
    @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
    konfirmasiPassword: string;

    @IsNotEmpty({ message: 'Nomor handphone tidak boleh kosong' })
    @IsString()
    nomorHandphone: string;

    @IsNotEmpty({ message: 'Informasi pendaftaran tidak boleh kosong' })
    @IsString()
    infoPendaftaran: string;
}