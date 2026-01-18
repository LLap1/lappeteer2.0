import { Injectable, Logger } from '@nestjs/common';
import type { CreateMapsInput, CreateMapsOutput } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    const { id, width, height, center, zoom } = params;
    const bbox = this.calculateBbox(center, zoom, width, height);

    const wmsUrl = this.buildWmsUrl(bbox, width, height);
    const filePath = await this.fetchMapAsFile(wmsUrl);

    return {
      id,
      layerDataUrls: [filePath],
    };
  }

  private calculateBbox(
    center: [number, number],
    zoom: number,
    width: number,
    height: number,
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    const [lat, lng] = center;

    const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);

    const halfWidthMeters = (width / 2) * metersPerPixel;
    const halfHeightMeters = (height / 2) * metersPerPixel;

    const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const metersPerDegLat = 110540;

    const minX = lng - halfWidthMeters / metersPerDegLng;
    const maxX = lng + halfWidthMeters / metersPerDegLng;
    const minY = lat - halfHeightMeters / metersPerDegLat;
    const maxY = lat + halfHeightMeters / metersPerDegLat;

    return { minX, minY, maxX, maxY };
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
