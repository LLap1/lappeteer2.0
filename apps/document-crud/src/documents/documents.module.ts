import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { TemplateModule } from '../templates/templates.module';
import { DocumentsController } from './documents.controller';
import { DocumentCreatorModule } from './document-creator/document-creator.module';

@Module({
  imports: [TemplateModule, DocumentCreatorModule],
  providers: [DocumentsService],
  exports: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
