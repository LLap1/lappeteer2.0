import { Module } from '@nestjs/common';
import { DocumentTemplateParserService } from './document-template-parser.service';

@Module({
  providers: [DocumentTemplateParserService],
  exports: [DocumentTemplateParserService],
})
export class DocumentTemplateParserModule {}
