import { Module } from '@nestjs/common';
import { WmsService } from './wms.service';
import { config } from '../../config';
import { GeoserverWmsService, GEOSERVER_WMS_BASE_URL } from './implementations/geoserver-wms.service';

@Module({
  providers: [
    {
      provide: GEOSERVER_WMS_BASE_URL,
      useValue: config.wmsService.baseUrl,
    },
    GeoserverWmsService,
    {
      provide: WmsService,
      useFactory: (geoserverWmsService: GeoserverWmsService) => {
        switch (config.wmsService.type) {
          case 'geoserver':
            return geoserverWmsService;
          default:
            throw new Error(`Unsupported WMS service type: ${config.wmsService.type}`);
        }
      },
      inject: [GeoserverWmsService],
    },
  ],
  exports: [WmsService],
})
export class WmsModule {}
