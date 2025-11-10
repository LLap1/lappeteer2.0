import { Module } from '@nestjs/common';
import { DocumentDataCreatorService } from './document-data-creator.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [DocumentDataCreatorService],
  exports: [DocumentDataCreatorService],
})
export class DocumentDataCreatorModule {}
