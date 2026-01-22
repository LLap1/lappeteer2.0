
import { type Config } from '../../config';
import { GeoserverWmsService } from './implementations/geoserver/geoserver-wms.service';
import { WmsService } from './wms.service';
import { GeoserverWmsModule } from './implementations/geoserver/geoserver-wms.module';

type WmsServiceType = Config['wmsService']['type'];

export const WMS_MODULES = [
    GeoserverWmsModule,
]

export const WMS_SERVICE_IMPLEMENTATIONS: Record<WmsServiceType, new (...args: never[]) => WmsService> = {
  geoserver: GeoserverWmsService,
};