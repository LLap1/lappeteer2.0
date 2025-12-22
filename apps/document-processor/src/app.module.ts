import { Module } from '@nestjs/common';
import { DocumentProcessorModule } from './services/document-processor.module';
import { config } from './config';
import { LoggerModule } from '@auto-document/nest/logger.module';

@Module({
  imports: [LoggerModule.forRoot(config.logger), DocumentProcessorModule],
})
export class AppModule {}
