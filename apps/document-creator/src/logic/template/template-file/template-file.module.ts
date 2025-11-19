import { Module } from '@nestjs/common';
import { TemplateFileService } from './template-file.service';
import { S3Module } from 'src/logic/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [TemplateFileService],
  exports: [TemplateFileService],
})
export class TemplateFileStorageModule {}
