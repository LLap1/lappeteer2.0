import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerDocumentCreatorService } from './puppeteer-document-creator.service';

describe('PuppeteerDocumentCreatorService', () => {
  let service: PuppeteerDocumentCreatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuppeteerDocumentCreatorService],
    }).compile();

    service = module.get<PuppeteerDocumentCreatorService>(PuppeteerDocumentCreatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
