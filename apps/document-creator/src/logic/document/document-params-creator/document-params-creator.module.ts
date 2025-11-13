import { Module } from '@nestjs/common';
import { DocumentParamsCreatorService } from './document-params-creator.service';

@Module({
  providers: [DocumentParamsCreatorService]
})
export class DocumentParamsCreatorModule {}
