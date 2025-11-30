import { Module } from '@nestjs/common';
import { TemplateFileService } from './template-file.service';
import { S3Module } from '@auto-document/nest/s3.module';

@Module({
  imports: [S3Module],
  providers: [TemplateFileService],
  exports: [TemplateFileService],
})
export class TemplateFileStorageModule {}
