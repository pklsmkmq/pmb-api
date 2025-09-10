// src/pendaftaran/pendaftaran.controller.ts
import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req, Patch, Param, Get, Query, ValidationPipe } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifyPendaftaranDto } from './dto/verify-pendaftaran.dto';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { FilterSantriDto } from './dto/filter-santri.dto';

@Controller('pendaftaran')
export class PendaftaranController {
    constructor(private readonly pendaftaranService: PendaftaranService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.SANTRI)
    @UseInterceptors(FileInterceptor('buktiPembayaran'))
    create(
        @Body() createPendaftaranDto: CreatePendaftaranDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any, // Untuk mendapatkan data user dari JWT
    ) {
        if (!file) {
            throw new BadRequestException('File bukti pembayaran wajib diupload.');
        }

        const user = req.user; // User dari JwtStrategy
        return this.pendaftaranService.create(createPendaftaranDto, file, user);
    }

    @Patch(':id/verify')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN) // Hanya Admin yang bisa mengakses
    verify(
        @Param('id') id: number,
        @Body() verifyPendaftaranDto: VerifyPendaftaranDto,
        @Req() req: any,
    ) {
        const admin = req.user; // Admin yang login dari JwtStrategy
        return this.pendaftaranService.verify(id, verifyPendaftaranDto, admin);
    }

    @Post('jadwal')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.SANTRI) // Hanya Santri yang bisa mengakses
    scheduleTest(
        @Body() createJadwalDto: CreateJadwalDto,
        @Req() req: any,
    ) {
        const user = req.user; // Santri yang login dari JwtStrategy
        return this.pendaftaranService.scheduleTest(createJadwalDto, user);
    }

    @Get('/santri')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN) // Hanya Admin yang bisa mengakses
    findAllSantri(@Query(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } })) filterDto: FilterSantriDto) {
        return this.pendaftaranService.findAllSantri(filterDto);
    }
}