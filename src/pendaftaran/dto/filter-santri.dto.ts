import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Jurusan } from '../enums/jurusan.enum';
import { StatusPendaftaranFilter } from '../enums/status-pendaftaran-filter.enum';
import { Type } from 'class-transformer';

export class FilterSantriDto {
  @IsOptional()
  @Type(() => Number) // Otomatis mengubah string query menjadi number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(Jurusan)
  jurusan?: Jurusan;

  @IsOptional()
  @IsEnum(StatusPendaftaranFilter)
  statusPendaftaran?: StatusPendaftaranFilter;
}