import { Test, TestingModule } from '@nestjs/testing';
import { DocumentGeneratorService } from './document-generator.service';

describe('DocumentGeneratorService', () => {
  let service: DocumentGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentGeneratorService],
    }).compile();

    service = module.get<DocumentGeneratorService>(DocumentGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
