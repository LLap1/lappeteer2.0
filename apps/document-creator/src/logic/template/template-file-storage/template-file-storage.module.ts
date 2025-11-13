import { Module } from '@nestjs/common';
import { TemplateFileService } from './template-file-storage.service';

@Module({
  providers: [TemplateFileService],
  exports: [TemplateFileService],
})
export class TemplateFileStorageModule {}
