import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { DocumentProcessorModule } from '../document-processor/document-processor.module';

@Module({
  imports: [DocumentProcessorModule],
  providers: [TemplateService],
  exports: [TemplateService],
  controllers: [TemplatesController],
})
export class TemplateModule {}
