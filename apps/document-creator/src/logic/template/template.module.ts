import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateParserModule } from './template-parser/template-parser.module';
import { TemplateFileStorageModule } from './template-file/template-file.module';
import { TemplateMetadataModule } from './template-metadata/template-metadata.module';
@Module({
  imports: [TemplateParserModule, TemplateFileStorageModule, TemplateMetadataModule],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
