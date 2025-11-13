import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [DocumentMapCreatorService],
  exports: [DocumentMapCreatorService],
})
export class DocumentDataCreatorModule {}
