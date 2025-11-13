import { Module } from '@nestjs/common';
import { DocumentGeneratorService } from './document-generator.service';

@Module({
  providers: [DocumentGeneratorService],
  exports: [DocumentGeneratorService],
})
export class DocumentGeneratorModule {}
