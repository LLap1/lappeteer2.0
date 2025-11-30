import { Module } from '@nestjs/common';
import { TemplateParserModule } from './template-parser/template-parser.module';
import { TemplateFileService } from './template-file.service';
import { TemplateGeneratorModule } from './template-generator/template-generator.module';
import { ProcessModule } from '@auto-document/nest/process.module';
import { TemplateFileController } from './template-file.controller';

@Module({
  imports: [TemplateParserModule, TemplateGeneratorModule, ProcessModule],
  providers: [TemplateFileService],
  controllers: [TemplateFileController],
  exports: [TemplateFileService],
})
export class TemplateFileModule {}
