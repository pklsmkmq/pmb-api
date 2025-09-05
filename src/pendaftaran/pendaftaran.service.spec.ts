import { Test, TestingModule } from '@nestjs/testing';
import { PendaftaranService } from './pendaftaran.service';

describe('PendaftaranService', () => {
  let service: PendaftaranService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendaftaranService],
    }).compile();

    service = module.get<PendaftaranService>(PendaftaranService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
