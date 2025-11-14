import { Module } from '@nestjs/common';
import { MapCreatorService } from './map-creator.service';

@Module({
  providers: [MapCreatorService],
  exports: [MapCreatorService],
})
export class MapCreatorModule {}
