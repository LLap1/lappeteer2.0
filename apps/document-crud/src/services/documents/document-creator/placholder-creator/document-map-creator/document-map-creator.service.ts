import { Injectable, Logger } from '@nestjs/common';
import type { CreateMapsInput, CreateMapsOutput } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import { featureCollection } from '@turf/helpers';
import bbox from '@turf/bbox';
import type { Feature, Geometry } from 'geojson';
import type { GeoJsonStyleOptions } from '@auto-document/domain/document-crud.schema';
import { OverlaysService } from 'src/services/overlays';
import { type BBox } from 'src/services/wms/wms.model';
import { WmsService } from 'src/services/wms/wms.service';

@Injectable()
export class DocumentMapCreatorService {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);

  constructor(
    private readonly overlaysService: OverlaysService,
    private readonly wmsService: WmsService,
  ) {}

  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsInput): Promise<CreateMapsOutput> {
    const maps = await Promise.all(request.map(params => this.createMap(params)));
    return maps;
  }

  private async createMap(params: CreateMapsInput[number]): Promise<CreateMapsOutput[number]> {
    const { id, width, height, geojson, overlayId } = params;
    const overlay = await this.overlaysService.getById({ id: overlayId });

    const bboxCoords = this.calculateBboxFromGeojson(geojson);

    const { imagePath } = await this.wmsService.getMap({
      layers: [overlay.id],
      bbox: bboxCoords,
      width,
      height,
    });

    return {
      id,
      layerDataUrls: [imagePath],
    };
  }

  private calculateBboxFromGeojson(geojson: Feature<Geometry, { style?: GeoJsonStyleOptions } | null>[]): BBox {
    const features = featureCollection<Geometry, { style?: GeoJsonStyleOptions } | null>(geojson);
    const [minX, minY, maxX, maxY] = bbox(features);

    const paddingPercent = 0.1;
    const widthPadding = (maxX - minX) * paddingPercent;
    const heightPadding = (maxY - minY) * paddingPercent;

    return {
      minX: minX - widthPadding,
      minY: minY - heightPadding,
      maxX: maxX + widthPadding,
      maxY: maxY + heightPadding,
    };
  }
}
