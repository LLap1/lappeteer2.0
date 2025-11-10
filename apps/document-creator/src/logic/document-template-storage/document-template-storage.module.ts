import { Module } from '@nestjs/common';
import { DocumentTemplateStorageService } from './document-template-storage.service';

@Module({
  providers: [DocumentTemplateStorageService],
  exports: [DocumentTemplateStorageService],
})
export class DocumentTemplateStorageModule {}
