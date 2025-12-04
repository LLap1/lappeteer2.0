import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplateFileStorageModule } from './template-file-storage/template-file-storage.module';
import { TemplateMetadataModule } from './template-metadata/template-metadata.module';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [TemplateFileStorageModule, TemplateMetadataModule],
  providers: [TemplateService],
  exports: [TemplateService],
  controllers: [TemplatesController],
})
export class TemplateModule {}
