import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { TemplateModule } from '../templates/templates.module';

@Module({
  imports: [DocumentCreatorModule, TemplateModule],
  providers: [DocumentsService],
  exports: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
