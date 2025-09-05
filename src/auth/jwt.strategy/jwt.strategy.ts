import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    const secret = configService.get<string>('JWT_SECRET'); // Ambil secret terlebih dahulu
    
    // Lakukan validasi. Jika tidak ada, hentikan aplikasi dengan error yang jelas.
    if (!secret) {
      throw new Error('Fatal Error: JWT_SECRET is not defined in the environment variables.');
    }
  
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // <-- Gunakan variabel secret yang sudah divalidasi
    });
  }

  // Method ini akan dipanggil oleh AuthGuard('jwt')
  async validate(payload: any): Promise<User> {
    const { id, email } = payload;
    const user = await this.usersRepository.findOne({ where: { id, email } });

    if (!user) {
      throw new UnauthorizedException();
    }
    // User yang di-return di sini akan di-inject ke dalam object Request
    return user;
  }
}