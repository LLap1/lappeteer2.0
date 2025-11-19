import { Module } from '@nestjs/common';
import { TemplateParserModule } from '../template/template-parser/template-parser.module';
import { DocumentService } from './document.service';
import { TemplateFileStorageModule } from '../template/template-file/template-file.module';
import { DocumentGeneratorModule } from './document-generator/document-generator.module';
import { TemplateMetadataModule } from '../template/template-metadata/template-metadata.module';
import { DocumentParamsCreatorModule } from './document-params-creator/document-params-creator.module';
@Module({
  imports: [TemplateFileStorageModule, TemplateMetadataModule, DocumentGeneratorModule, DocumentParamsCreatorModule],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
