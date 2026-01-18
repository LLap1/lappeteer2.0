import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';

@Module({
  providers: [DocumentMapCreatorService],
  exports: [DocumentMapCreatorService],
})
export class DocumentMapCreatorModule {}
