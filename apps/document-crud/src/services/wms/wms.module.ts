import { Module } from '@nestjs/common';
import { WmsService } from './wms.service';
import { config, type Config } from '../../config';
import { GeoserverWmsService } from './implementations/geoserver-wms.service';
import { OverlaysModule } from './overlays/overlays.module';

type WmsServiceType = Config['wmsService']['type'];

const WMS_SERVICE_IMPLEMENTATIONS: Record<WmsServiceType, new (...args: never[]) => WmsService> = {
  geoserver: GeoserverWmsService,
};

@Module({
  imports: [OverlaysModule],
  providers: [
    GeoserverWmsService,
    {
      provide: WmsService,
      useExisting: WMS_SERVICE_IMPLEMENTATIONS[config.wmsService.type],
    },
  ],
  exports: [WmsService],
})
export class WmsModule {}
