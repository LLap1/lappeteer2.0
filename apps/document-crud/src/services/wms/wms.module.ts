import { Module } from '@nestjs/common';
import { WmsService } from './wms.service';
import { GeoserverWmsService } from './implementations/geoserver/geoserver-wms.service';
import { GeoserverWmsModule } from './implementations/geoserver/geoserver-wms.module';

@Module({
  imports: [GeoserverWmsModule],
  providers: [
    {
      provide: WmsService,
      useExisting: GeoserverWmsService,
    },
  ],
  exports: [WmsService],
})
export class WmsModule {}
