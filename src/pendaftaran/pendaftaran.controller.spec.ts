import { Test, TestingModule } from '@nestjs/testing';
import { PendaftaranController } from './pendaftaran.controller';

describe('PendaftaranController', () => {
  let controller: PendaftaranController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendaftaranController],
    }).compile();

    controller = module.get<PendaftaranController>(PendaftaranController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
