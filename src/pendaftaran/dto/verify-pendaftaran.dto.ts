import { IsEnum, IsNotEmpty } from 'class-validator';
import { PendaftaranStatus } from '../enums/pendaftaran-status.enum';

export class VerifyPendaftaranDto {
    @IsNotEmpty()
    @IsEnum([PendaftaranStatus.APPROVED, PendaftaranStatus.REJECTED]) // Hanya boleh APPROVED atau REJECTED
    status: PendaftaranStatus;
}