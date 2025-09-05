// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Aktifkan ValidationPipe secara global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Otomatis menghapus properti yang tidak ada di DTO
    forbidNonWhitelisted: true, // Memberi error jika ada properti yang tidak terdefinisi di DTO
    transform: true, // Otomatis mengubah tipe data payload sesuai DTO
  }));

  await app.listen(3000);
}
bootstrap();