import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Jurusan } from '../enums/jurusan.enum';

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

  @IsString()
  @IsOptional()
  jumlahHafalanJuz?: string;

  @IsEnum(Jurusan)
  @IsNotEmpty()
  jurusan: Jurusan;

  @IsString()
  @IsOptional()
  ilmuIT?: string;
}