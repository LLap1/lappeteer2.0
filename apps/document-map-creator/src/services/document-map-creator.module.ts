import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { config } from '../config';

@Module({
  controllers: [DocumentMapCreatorService],
  providers: [
    {
      provide: 'MAP_CREATOR_CONFIG',
      useValue: config.MapCreator,
    },
  ],
})
export class DocumentMapCreatorModule {}
