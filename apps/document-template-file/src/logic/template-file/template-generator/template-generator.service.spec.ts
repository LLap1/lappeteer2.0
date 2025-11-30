import { Test, TestingModule } from '@nestjs/testing';
import { TemplateGeneratorService } from './template-generator.service';

describe('DocumentGeneratorService', () => {
  let service: TemplateGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateGeneratorService],
    }).compile();

    service = module.get<TemplateGeneratorService>(TemplateGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
