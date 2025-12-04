import { Module } from '@nestjs/common';
import { ProcessModule } from '@auto-document/nest/process.module';
import { DocumentProcessorController } from './document-processor.controller';
import { DocumentProcessorService } from './document-processor.service';

@Module({
  imports: [ProcessModule],
  providers: [DocumentProcessorService],
  controllers: [DocumentProcessorController],
  exports: [DocumentProcessorService],
})
export class DocumentProcessorModule {}
