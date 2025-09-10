import { User } from '../../users/user.entity';
import { PendaftaranStatus } from '../../pendaftaran/enums/pendaftaran-status.enum';

// Buat interface untuk status pendaftaran agar lebih rapi
export interface PendaftaranStatusInfo {
    sudahMendaftar: boolean;
    statusPembayaran: PendaftaranStatus | null;
    sudahMenjadwalkanTes: boolean;
}

export interface LoginResponse {
    message: string;
    data: {
        user: Omit<User, 'password' | 'hashPassword'>;
        accessToken: string;
        // Tambahkan properti baru, bisa null jika rolenya admin
        pendaftaranStatus: PendaftaranStatusInfo | null;
    };
}