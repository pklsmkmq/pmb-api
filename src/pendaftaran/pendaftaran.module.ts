// src/pendaftaran/pendaftaran.module.ts

import { Module } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { PendaftaranController } from './pendaftaran.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Biodata } from './entities/biodata.entity';
import { Pendaftaran } from './entities/pendaftaran.entity';
import { JadwalTes } from './entities/jadwal-tes.entity';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, // Kita butuh UserRepo di sini
      Biodata,
      Pendaftaran,
      JadwalTes
    ]),
    AuthModule,
    CloudinaryModule 
  ],
  controllers: [PendaftaranController],
  providers: [PendaftaranService],
})
export class PendaftaranModule {}