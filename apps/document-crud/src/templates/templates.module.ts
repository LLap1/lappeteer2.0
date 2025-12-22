import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  providers: [TemplateService],
  exports: [TemplateService],
  controllers: [TemplatesController],
})
export class TemplateModule {}
