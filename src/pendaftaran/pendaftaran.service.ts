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
import { UserRole } from '../users/user-role.enum';
import { FilterSantriDto } from './dto/filter-santri.dto';
import { StatusPendaftaranFilter } from './enums/status-pendaftaran-filter.enum';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

@Injectable()
export class PendaftaranService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
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

    async verify(userId: number, verifyPendaftaranDto: VerifyPendaftaranDto, admin: User) {
        // 1. Cari pendaftaran berdasarkan ID
        const pendaftaran = await this.pendaftaranRepository.findOne({
            where: { user: { id: userId } },
        });

        // 2. Jika tidak ditemukan, lempar error
        if (!pendaftaran) {
            throw new NotFoundException(`Pendaftaran untuk User dengan ID ${userId} tidak ditemukan.`);
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

    async findAllSantri(filterDto: FilterSantriDto) {
        const { jurusan, statusPendaftaran, page = 1, limit = 10 } = filterDto;

        // 1. MEMBUAT QUERY MENGGUNAKAN QUERY BUILDER
        const query = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.biodata', 'biodata') // LEFT JOIN ke tabel biodata
            .leftJoinAndSelect('user.pendaftaran', 'pendaftaran') // LEFT JOIN ke tabel pendaftaran
            .where('user.role = :role', { role: UserRole.SANTRI }); // Hanya ambil user dengan role SANTRI

        // 2. MENERAPKAN FILTER KONDISIONAL
        if (jurusan) {
            query.andWhere('biodata.jurusan = :jurusan', { jurusan });
        }

        if (statusPendaftaran) {
            if (statusPendaftaran === StatusPendaftaranFilter.SUDAH_MENDAFTAR) {
                query.andWhere('pendaftaran.id IS NOT NULL'); // Jika pendaftaran.id ada, berarti sudah mendaftar
            } else if (statusPendaftaran === StatusPendaftaranFilter.BELUM_MENDAFTAR) {
                query.andWhere('pendaftaran.id IS NULL'); // Jika pendaftaran.id null, berarti belum mendaftar
            }
        }

        // 3. MENERAPKAN PAGINASI
        query.skip((page - 1) * limit).take(limit);

        // 4. EKSEKUSI QUERY DAN MENGAMBIL HASIL
        const [users, total] = await query.getManyAndCount();

        // 5. TRANSFORMASI DATA SESUAI FORMAT YANG DIINGINKAN
        const data = users.map(user => ({
            id: user.id,
            nama: user.namaSantri ?? '-', // <-- DIUBAH: Mengambil dari tabel user
            nomorTelepon: user.nomorHandphone ?? '-', // <-- BARU: Menambahkan nomor telepon
            sekolahAsal: user.biodata?.sekolahAsal ?? '-',
            jurusan: user.biodata?.jurusan ?? '-',
            jumlahHafalanJuz: user.biodata?.jumlahHafalanJuz ?? '-',
            ilmuIT: user.biodata?.ilmuIT ?? '-',
            statusPembayaran: user.pendaftaran?.statusPembayaran ?? '-',
            buktiPembayaran: user.pendaftaran?.buktiPembayaranUrl ?? '-',
            // <-- BARU: Menambahkan tanggal registrasi yang diformat
            tanggalRegistrasi: user.createdAt
                ? format(user.createdAt, 'EEEE, dd MMMM yyyy HH:mm', { locale: id })
                : '-',
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}