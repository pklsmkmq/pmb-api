import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreatePendaftaranDto {
  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @IsString()
  @IsNotEmpty()
  nisn: string;

  @IsString()
  @IsNotEmpty()
  sekolahAsal: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

  @IsString()
  @IsNotEmpty()
  tempatLahir: string;

  @IsDateString()
  @IsNotEmpty()
  tanggalLahir: Date;
}