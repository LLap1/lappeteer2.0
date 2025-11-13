import { Module } from '@nestjs/common';
import { TemplateMetadataStorageService } from './template-metadata-storage.service';

@Module({
  providers: [TemplateMetadataStorageService],
  exports: [TemplateMetadataStorageService],
})
export class TemplateMetadataStorageModule {}
