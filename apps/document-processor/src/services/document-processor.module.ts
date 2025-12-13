import { Module } from '@nestjs/common';
import { DocumentProcessorService } from './document-processor.service';

@Module({
  controllers: [DocumentProcessorService],
})
export class DocumentProcessorModule {}
