import { Module } from '@nestjs/common';
import { PuppeteerDocumentCreatorService } from './puppeteer-document-creator.service';

@Module({
  providers: [PuppeteerDocumentCreatorService],
  exports: [PuppeteerDocumentCreatorService],
})
export class PuppeteerDocumentCreatorModule {}
