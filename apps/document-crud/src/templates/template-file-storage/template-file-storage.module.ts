import { Module } from '@nestjs/common';
import { TemplateFileStorageService } from './template-file-storage.service';
import { S3Module } from '@auto-document/nest/s3.module';

@Module({
  imports: [S3Module],
  providers: [TemplateFileStorageService],
  exports: [TemplateFileStorageService],
})
export class TemplateFileStorageModule {}
    