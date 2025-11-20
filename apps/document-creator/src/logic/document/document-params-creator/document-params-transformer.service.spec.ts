import { Test, TestingModule } from '@nestjs/testing';
import { DocumentParamsTransformerService } from './document-params-transformer.service';

describe('DocumentParamsCreatorService', () => {
  let service: DocumentParamsTransformerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentParamsTransformerService],
    }).compile();

    service = module.get<DocumentParamsTransformerService>(DocumentParamsTransformerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
