import { Module } from '@nestjs/common';
import { DocumentCreatorService } from './document-creator.service';
import { PlaceholderCreatorModule } from './placholder-creator/placeholder-creator.module';
import { DocumentProcessorModule } from '../../document-processor/document-processor.module';

@Module({
  imports: [PlaceholderCreatorModule, DocumentProcessorModule],
  providers: [DocumentCreatorService],
  exports: [DocumentCreatorService],
})
export class DocumentCreatorModule {}
