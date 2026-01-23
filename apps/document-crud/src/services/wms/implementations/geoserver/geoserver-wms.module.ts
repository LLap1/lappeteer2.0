import { Module } from '@nestjs/common';
import { GeoserverWmsService } from './geoserver-wms.service';
import { OverlaysModule } from '../../overlays/overlays.module';

@Module({
  imports: [OverlaysModule],
  providers: [
    GeoserverWmsService,
  ],
  exports: [GeoserverWmsService],
})
export class GeoserverWmsModule {}
