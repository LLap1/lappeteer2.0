import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';

@Module({
  controllers: [DocumentMapCreatorService],
})
export class DocumentMapCreatorModule {}
