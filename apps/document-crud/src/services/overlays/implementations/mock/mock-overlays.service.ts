import { Injectable, Logger } from '@nestjs/common';
import {
  type GroundToImageOutput,
  type GroundToImageInput,
  type GetOverlayByIdInput,
  type Overlay,
  type GetPixelWmsUrlInput,
  type GetPixelWmsUrlOutput,
} from '../../overlays.model';
import { Log } from '@auto-document/utils/log';
import { OverlaysService } from '../../overlays.service';
import { Geometry } from 'geojson';

@Injectable()
export class MockOverlaysService extends OverlaysService {
  private static readonly logger: Logger = new Logger(MockOverlaysService.name);

  @Log(MockOverlaysService.logger)
  async getById(request: GetOverlayByIdInput): Promise<Overlay> {
    return {
      id: request.id,
      pixelWmsUrl: `http://localhost:8080/geoserver/ows?service=WMS&version=1.1.1&request=GetCapabilities`,
      pixelTileUrl: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
      gridUrl: `http://localhost:8080/geoserver/ne/wms`,
    };
  }

  @Log(MockOverlaysService.logger)
  async buildPixelWmsUrl(request: GetPixelWmsUrlInput): Promise<GetPixelWmsUrlOutput> {
    return '/ows';
  }

  @Log(MockOverlaysService.logger)
  async groundToImage(request: GroundToImageInput): Promise<GroundToImageOutput> {
    return request.geometry;
  }
}
