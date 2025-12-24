import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { config } from '../../../../../config';

@Module({
  providers: [
    DocumentMapCreatorService,
    {
      provide: 'MAP_CREATOR_CONFIG',
      useValue: config.mapCreator,
    },
  ],
  exports: [DocumentMapCreatorService],
})
export class DocumentMapCreatorModule {}
