import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplateMetadataModule } from './template-metadata/template-metadata.module';
import { TemplatesController } from './templates.controller';
import { S3Module } from '@auto-document/nest/s3.module';

@Module({
  imports: [S3Module, TemplateMetadataModule],
  providers: [TemplateService],
  exports: [TemplateService],
  controllers: [TemplatesController],
})
export class TemplateModule {}
