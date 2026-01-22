import { Module } from '@nestjs/common';
import { GeoserverWmsService } from './geoserver-wms.service';

@Module({
  providers: [
    GeoserverWmsService,
  ],
  exports: [GeoserverWmsService],
})
export class GeoserverWmsModule {}
