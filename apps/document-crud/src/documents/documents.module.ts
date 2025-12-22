import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { TemplateModule } from '../templates/templates.module';
import { S3Module } from 'node_modules/@auto-document/nest/src/s3/s3.module';
import { config } from '../config';

@Module({
  imports: [DocumentCreatorModule, TemplateModule, S3Module],
  providers: [
    {
      provide: 'BASE_URL',
      useValue: config.server.baseUrl,
    },
    DocumentsService,
  ],
  exports: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
