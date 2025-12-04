import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { DocumentMapCreatorController } from './document-map-creator.controller';

@Module({
  providers: [DocumentMapCreatorService],
  exports: [DocumentMapCreatorService],
  controllers: [DocumentMapCreatorController],
})
export class DocumentMapCreatorModule {}
