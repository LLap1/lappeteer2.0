import { Module } from '@nestjs/common';
import { TemplateParserModule } from '../template/template-parser/template-parser.module';
import { DocumentService } from './document.service';
import { DocumentDataCreatorModule } from './document-map-creator/document-map-creator.module';
import { TemplateFileStorageModule } from '../template/template-file-storage/template-file-storage.module';
import { DocumentGeneratorModule } from './document-generator/document-generator.module';
import { TemplateMetadataStorageModule } from '../template/template-metadata-storage/template-metadata-storage.module';
import { DocumentParamsCreatorService } from './document-params-creator/document-params-creator.service';
import { DocumentParamsCreatorModule } from './document-params-creator/document-params-creator.module';
@Module({
  imports: [
    DocumentDataCreatorModule,
    TemplateFileStorageModule,
    TemplateMetadataStorageModule,
    DocumentGeneratorModule,
    DocumentParamsCreatorModule,
  ],
  providers: [DocumentService, DocumentParamsCreatorService],
  exports: [DocumentService],
})
export class DocumentModule {}
