import { Module } from '@nestjs/common';
import { TemplateFileModule } from './template-file/template-file.module';

@Module({
  imports: [TemplateFileModule],
})
export class AppModule {}
