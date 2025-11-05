import { Module } from '@nestjs/common';
import { DocumentCreatorService } from './document-creator.model';
import { PuppeteerDocumentCreatorModule } from '../puppeteer-document-creator/puppeteer-document-creator.module';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { PuppeteerDocumentCreatorService } from '../puppeteer-document-creator/puppeteer-document-creator.service';

@Module({
  imports: [PuppeteerDocumentCreatorModule],
  providers: [
    {
      provide: DocumentCreatorService,
      useFactory: async (
        configService: ConfigService,
        puppeteerDocumentCreatorService: PuppeteerDocumentCreatorService,
      ) => {
        const config = configService.get<Config['documentCreator']>('documentCreator')!;
        switch (config.type) {
          case 'puppeteer':
            return puppeteerDocumentCreatorService;
          default:
            throw new Error('Invalid document creator type');
        }
      },
      inject: [ConfigService, PuppeteerDocumentCreatorService],
    },
  ],
  exports: [DocumentCreatorService],
})
export class DocumentCreatorModule {}
