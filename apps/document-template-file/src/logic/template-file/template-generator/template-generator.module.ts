import { Module } from '@nestjs/common';
import { TemplateGeneratorService } from './template-generator.service';
import { ProcessModule } from '@auto-document/nest/process.module';

@Module({
  imports: [ProcessModule],
  providers: [TemplateGeneratorService],
  exports: [TemplateGeneratorService],
})
export class TemplateGeneratorModule {}
