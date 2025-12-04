import { Module } from '@nestjs/common';
import { DocumentCreatorService } from './document-creator.service';
import { DocumentParamsCreatorModule } from './document-params-transformer/document-params-transformer.module';

@Module({
  imports: [DocumentParamsCreatorModule, DocumentParamsCreatorModule],
  providers: [DocumentCreatorService],
  exports: [DocumentCreatorService],
})
export class DocumentCreatorModule {}
