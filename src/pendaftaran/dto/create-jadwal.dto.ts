// src/pendaftaran/dto/create-jadwal.dto.ts

import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { TesJenis } from '../enums/tes-jenis.enum';
import { TesMetode } from '../enums/tes-metode.enum';

export class CreateJadwalDto {
  @IsNotEmpty()
  @IsEnum(TesJenis)
  jenisTes: TesJenis;

  @IsNotEmpty()
  @IsEnum(TesMetode)
  metode: TesMetode;

  @IsNotEmpty()
  @IsDateString()
  tanggalWaktu: Date;
}