import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplateMetadataModule } from './template-metadata/template-metadata.module';
import { TemplatesController } from './templates.controller';
import { FileStorageModule } from '@auto-document/nest/file.module';

@Module({
  imports: [FileStorageModule, TemplateMetadataModule],
  providers: [TemplateService],
  exports: [TemplateService],
  controllers: [TemplatesController],
})
export class TemplateModule {}
