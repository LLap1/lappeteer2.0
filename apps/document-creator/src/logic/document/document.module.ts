import { Module } from '@nestjs/common';
import { DocumentTemplateParserModule } from '../document-template-parser/document-template-parser.module';
import { DocumentService } from './document.service';
import { DocumentDataCreatorModule } from '../document-data-creator/document-data-creator.module';
import { DocumentTemplateStorageModule } from '../document-template-storage/document-template-storage.module';
@Module({
  imports: [DocumentDataCreatorModule, DocumentTemplateParserModule, DocumentTemplateStorageModule],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
