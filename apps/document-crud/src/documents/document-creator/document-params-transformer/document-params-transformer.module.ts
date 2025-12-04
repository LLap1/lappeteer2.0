import { Module } from '@nestjs/common';
import { DocumentParamsTransformerService } from './document-params-transformer.service';

@Module({
  providers: [DocumentParamsTransformerService],
  exports: [DocumentParamsTransformerService],
})
export class DocumentParamsCreatorModule {}
