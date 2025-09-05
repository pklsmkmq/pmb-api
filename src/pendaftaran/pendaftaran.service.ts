// src/pendaftaran/pendaftaran.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Biodata } from './entities/biodata.entity';
import { Repository, EntityManager } from 'typeorm';
import { Pendaftaran } from './entities/pendaftaran.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../users/user.entity';
import { VerifyPendaftaranDto } from './dto/verify-pendaftaran.dto';
import { JadwalTes } from './entities/jadwal-tes.entity';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { PendaftaranStatus } from './enums/pendaftaran-status.enum';

@Injectable()
export class PendaftaranService {
    constructor(
        @InjectRepository(Biodata)
        private biodataRepository: Repository<Biodata>,
        @InjectRepository(Pendaftaran)
        private pendaftaranRepository: Repository<Pendaftaran>,
        @InjectRepository(JadwalTes)
        private jadwalTesRepository: Repository<JadwalTes>,
        private cloudinaryService: CloudinaryService,
        private entityManager: EntityManager, // Untuk transaksi
    ) { }

    async create(createPendaftaranDto: CreatePendaftaranDto, file: Express.Multer.File, user: User) {
        // Cek apakah user sudah pernah mendaftar
        const existingPendaftaran = await this.pendaftaranRepository.findOne({ where: { user: { id: user.id } } });
        if (existingPendaftaran) {
            throw new ConflictException('Anda sudah pernah melakukan pendaftaran.');
        }

        const uploadResult = await this.cloudinaryService.uploadFile(file);

        // Gunakan transaksi agar jika salah satu gagal, semua dibatalkan
        return this.entityManager.transaction(async transactionalEntityManager => {
            // 1. Simpan biodata
            const newBiodata = this.biodataRepository.create({
                ...createPendaftaranDto,
                user: user,
            });
            await transactionalEntityManager.save(newBiodata);

            // 2. Simpan pendaftaran
            const newPendaftaran = this.pendaftaranRepository.create({
                buktiPembayaranUrl: uploadResult.secure_url,
                user: user,
                // statusPembayaran default 'PENDING'
            });
            await transactionalEntityManager.save(newPendaftaran);

            return { message: 'Pendaftaran berhasil, pembayaran Anda akan segera diverifikasi.' };
        });
    }

    async verify(pendaftaranId: number, verifyPendaftaranDto: VerifyPendaftaranDto, admin: User) {
        // 1. Cari pendaftaran berdasarkan ID
        const pendaftaran = await this.pendaftaranRepository.findOne({
            where: { id: pendaftaranId },
        });

        // 2. Jika tidak ditemukan, lempar error
        if (!pendaftaran) {
            throw new NotFoundException(`Pendaftaran dengan ID ${pendaftaranId} tidak ditemukan.`);
        }

        // 3. Update status dan data verifikasi
        pendaftaran.statusPembayaran = verifyPendaftaranDto.status;
        pendaftaran.diverifikasiOleh = admin;
        pendaftaran.tanggalVerifikasi = new Date();

        // 4. Simpan perubahan ke database
        return this.pendaftaranRepository.save(pendaftaran);
    }

    async scheduleTest(createJadwalDto: CreateJadwalDto, user: User) {
        // 1. Cari data pendaftaran milik user yang sedang login
        const pendaftaran = await this.pendaftaranRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['jadwalTes'], // Sertakan relasi jadwalTes untuk pengecekan
        });

        // 2. Jika user belum pernah mendaftar sama sekali
        if (!pendaftaran) {
            throw new NotFoundException('Anda harus menyelesaikan pendaftaran terlebih dahulu.');
        }

        // 3. VALIDASI KRUSIAL: Cek status pembayaran
        if (pendaftaran.statusPembayaran !== PendaftaranStatus.APPROVED) {
            throw new ForbiddenException('Pembayaran Anda belum diverifikasi oleh admin. Anda belum bisa menjadwalkan tes.');
        }

        // 4. VALIDASI: Cek apakah jenis tes yang sama sudah pernah dijadwalkan
        const isTestAlreadyScheduled = pendaftaran.jadwalTes.some(
            (jadwal) => jadwal.jenisTes === createJadwalDto.jenisTes,
        );
        if (isTestAlreadyScheduled) {
            throw new ConflictException(`Anda sudah pernah menjadwalkan untuk ${createJadwalDto.jenisTes}.`);
        }

        // 5. Buat entitas JadwalTes baru
        const newJadwal = this.jadwalTesRepository.create({
            ...createJadwalDto,
            pendaftaran: pendaftaran, // Hubungkan dengan data pendaftaran
        });

        // 6. Simpan ke database
        return this.jadwalTesRepository.save(newJadwal);
    }
}