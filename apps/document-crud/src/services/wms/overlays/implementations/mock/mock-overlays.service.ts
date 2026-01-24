import { Injectable, Logger } from '@nestjs/common';
import {
  type GroundToImageOutput,
  type GroundToImageInput,
  type GetOverlayByIdInput,
  type GetOverlayByIdOutput,
} from '../../overlays.model';
import { Log } from '@auto-document/utils/log';
import { OverlaysService } from '../../overlays.service';
import { Geometry } from 'geojson';

@Injectable()
export class MockOverlaysService extends OverlaysService {
  private static readonly logger: Logger = new Logger(MockOverlaysService.name);

  @Log(MockOverlaysService.logger)
  async getById(request: GetOverlayByIdInput): Promise<GetOverlayByIdOutput> {
    return {
      id: request.id,
      tileUrl: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
      gridUrl: `http://localhost:8080/geoserver/ne/wms`,
    };
  }

  @Log(MockOverlaysService.logger)
  async groundToImage(request: GroundToImageInput): Promise<GroundToImageOutput> {
    const [minX, minY, maxX, maxY] = request.cropBbox;
    const { cropWidth: width, cropHeight: height } = request;

    const transformCoord = (x: number, y: number): [number, number] => {
      const pixelX = ((x - minX) / (maxX - minX)) * width;
      const pixelY = ((maxY - y) / (maxY - minY)) * height;
      return [pixelX, pixelY];
    };

    const transformCoordinates = (coords: any): any => {
      if (typeof coords[0] === 'number') {
        return transformCoord(coords[0], coords[1]);
      }
      return coords.map((c: any) => transformCoordinates(c));
    };

    if (request.geometry.type === 'GeometryCollection') {
      return {
        ...request.geometry,
        geometries: request.geometry.geometries.map(geom => ({
          ...geom,
          coordinates: transformCoordinates((geom as any).coordinates),
        })),
      };
    }

    const transformedGeometry: Geometry = {
      ...request.geometry,
      coordinates: transformCoordinates((request.geometry as any).coordinates),
    };

    return transformedGeometry;
  }
}
