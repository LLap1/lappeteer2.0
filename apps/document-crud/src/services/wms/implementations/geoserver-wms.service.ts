import { Injectable } from '@nestjs/common';
import { type GetMapInput } from '../wms.model';
import { WmsService } from '../wms.service';
import { OverlaysService } from '../overlays/overlays.service';
import type { Overlay } from '../overlays/overlays.model';

@Injectable()
export class GeoserverWmsService extends WmsService {
  constructor(overlaysService: OverlaysService) {
    super(overlaysService);
  }

  protected buildWmsUrl(overlay: Overlay, input: GetMapInput): string {
    const { bbox, width, height, format = 'png' } = input;

    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: overlay.id,
      CRS: "EPSG:4326",
      BBOX: `${bbox.minY},${bbox.minX},${bbox.maxY},${bbox.maxX}`,
      WIDTH: String(Math.round(width)),
      HEIGHT: String(Math.round(height)),
      FORMAT: `image/${format}`,
    });

    return `${overlay.streamingUrl}?${params.toString()}`;
  }
}
