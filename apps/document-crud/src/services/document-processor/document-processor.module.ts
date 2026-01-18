import { Module } from '@nestjs/common';
import { DocumentProcessorService } from './document-processor.service';
import { config } from '../../config';

@Module({
  providers: [
    DocumentProcessorService,
    {
      provide: 'SCRIPTS_PATH',
      useValue: config.documentProcessor.scriptsPath,
    },
  ],
  exports: [DocumentProcessorService],
})
export class DocumentProcessorModule {}
