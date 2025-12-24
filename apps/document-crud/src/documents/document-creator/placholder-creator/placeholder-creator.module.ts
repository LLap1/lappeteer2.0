import { Module } from '@nestjs/common';
import { PlaceholderCreatorService } from './placeholder-creator.service';
import { DocumentMapCreatorModule } from './document-map-creator/document-map-creator.module';

@Module({
  imports: [DocumentMapCreatorModule],
  providers: [PlaceholderCreatorService],
  exports: [PlaceholderCreatorService],
})
export class PlaceholderCreatorModule {}
