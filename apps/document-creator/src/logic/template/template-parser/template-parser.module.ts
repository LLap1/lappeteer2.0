import { Module } from '@nestjs/common';
import { TemplateParserService } from './template-parser.service';
import { ProcessModule } from '../../process/process.module';

@Module({
  imports: [ProcessModule],
  providers: [TemplateParserService],
  exports: [TemplateParserService],
})
export class TemplateParserModule {}
