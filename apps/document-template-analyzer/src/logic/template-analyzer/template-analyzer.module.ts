import { Module } from '@nestjs/common';
import { TemplateAnalyzerService } from './template-analyzer.service';
import { ProcessModule } from '@auto-document/nest/process.module';
import { TemplateAnalyzerController } from './template-analyzer.controller';

@Module({
  imports: [ProcessModule],
  providers: [TemplateAnalyzerService],
  controllers: [TemplateAnalyzerController],
  exports: [TemplateAnalyzerService],
})
export class TemplateAnalyzerModule {}
