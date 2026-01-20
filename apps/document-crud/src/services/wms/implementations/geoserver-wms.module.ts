import { Module } from '@nestjs/common';
import { config } from 'src/config';
import { GeoserverWmsService, GEOSERVER_WMS_BASE_URL } from './geoserver-wms.service';

@Module({
  providers: [
    {
      provide: GEOSERVER_WMS_BASE_URL,
      useValue: config.wmsService.baseUrl,
    },
    GeoserverWmsService,
  ],
  exports: [GeoserverWmsService],
})
export class WmsModule {}
