import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateParserModule } from './template-parser/template-parser.module';
import { TemplateFileStorageModule } from './template-file-storage/template-file-storage.module';
import { TemplateMetadataStorageModule } from './template-metadata-storage/template-metadata-storage.module';
import { TemplateMetadataStorageService } from './template-metadata-storage/template-metadata-storage.service';
import { TemplateFileService } from './template-file-storage/template-file-storage.service';
@Module({
  imports: [TemplateParserModule, TemplateFileStorageModule, TemplateMetadataStorageModule],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
