import { Injectable, Logger } from '@nestjs/common';
import type { CreateMapsInput, CreateMapsOutput } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { featureCollection } from '@turf/helpers';
import bbox from '@turf/bbox';

const WMS_BASE_URL = 'http://localhost:8080/geoserver/ne/wms';

@Injectable()
export class DocumentMapCreatorService {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);

  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsInput): Promise<CreateMapsOutput> {
    const maps = await Promise.all(request.map(params => this.createMap(params)));
    return maps;
  }

  private async createMap(params: CreateMapsInput[number]): Promise<CreateMapsOutput[number]> {
    const { id, width, height, geojson } = params;

    const bboxCoords = this.calculateBboxFromGeojson(geojson);
    const wmsUrl = this.buildWmsUrl(bboxCoords, width, height);
    const mapPath = await this.fetchMapAsFile(wmsUrl);

    return {
      id,
      layerDataUrls: [mapPath],
    };
  }

  private calculateBboxFromGeojson(geojson: CreateMapsInput[number]['geojson']): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    const features = featureCollection(geojson);
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

  private buildWmsUrl(
    bbox: { minX: number; minY: number; maxX: number; maxY: number },
    width: number,
    height: number,
  ): string {
    const params = new URLSearchParams({
      VERSION: '1.3.0',
      SERVICE: 'WMS',
      REQUEST: 'GetMap',
      LAYERS: 'ne:world',
      STYLES: '',
      CRS: 'EPSG:4326',
      BBOX: `${bbox.minY},${bbox.minX},${bbox.maxY},${bbox.maxX}`,
      WIDTH: String(Math.round(width)),
      HEIGHT: String(Math.round(height)),
      FORMAT: 'image/png',
    });

    return `${WMS_BASE_URL}?${params.toString()}`;
  }

  private async fetchMapAsFile(url: string): Promise<string> {
    const response = await fetch(url);
    const tempDir = '/tmp';
    const filePath = path.join(tempDir, `map-${uuidv4()}.png`);
    await Bun.write(filePath, await response.arrayBuffer());
    return filePath;
  }
}
