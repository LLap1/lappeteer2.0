import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { TemplateModule } from '../templates/templates.module';
import { S3Module } from 'node_modules/@auto-document/nest/src/s3/s3.module';

@Module({
  imports: [DocumentCreatorModule, S3Module, TemplateModule],
  providers: [DocumentsService],
  exports: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
