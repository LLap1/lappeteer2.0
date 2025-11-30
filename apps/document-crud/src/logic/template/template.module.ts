import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateFileStorageModule } from './template-file/template-file.module';
import { TemplateMetadataModule } from './template-metadata/template-metadata.module';
import { TemplateController } from './template.controller';

@Module({
  imports: [TemplateFileStorageModule, TemplateMetadataModule],
  providers: [TemplateService],
  exports: [TemplateService],
  controllers: [TemplateController],
})
export class TemplateModule {}
