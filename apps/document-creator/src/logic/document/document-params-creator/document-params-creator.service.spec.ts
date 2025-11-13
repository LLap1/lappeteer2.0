import { Test, TestingModule } from '@nestjs/testing';
import { DocumentParamsCreatorService } from './document-params-creator.service';

describe('DocumentParamsCreatorService', () => {
  let service: DocumentParamsCreatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentParamsCreatorService],
    }).compile();

    service = module.get<DocumentParamsCreatorService>(DocumentParamsCreatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
