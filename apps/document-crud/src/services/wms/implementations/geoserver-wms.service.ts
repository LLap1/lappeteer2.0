import { Inject, Injectable, Logger } from '@nestjs/common';
import { type GetMapInput, type GetMapOutput } from '../wms.model';
import { Log } from '@auto-document/utils/log';
import { WmsService } from '../wms.service';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const GEOSERVER_WMS_BASE_URL = 'GEOSERVER_WMS_BASE_URL';

@Injectable()
export class GeoserverWmsService extends WmsService {
  private static readonly logger: Logger = new Logger(GeoserverWmsService.name);

  constructor(@Inject(GEOSERVER_WMS_BASE_URL) private readonly baseUrl: string) {
    super();
  }

  @Log(GeoserverWmsService.logger)
  async getMap(input: GetMapInput): Promise<GetMapOutput> {
    const url = this.buildWmsUrl(input);
    const imagePath = await this.fetchAndSaveImage(url);

    return { imagePath };
  }

  private buildWmsUrl(input: GetMapInput): string {
    const { layers, bbox, width, height, crs = 'EPSG:4326', format = 'image/png', styles = [] } = input;

    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: layers.join(','),
      STYLES: styles.join(','),
      CRS: crs,
      BBOX: `${bbox.minY},${bbox.minX},${bbox.maxY},${bbox.maxX}`,
      WIDTH: String(Math.round(width)),
      HEIGHT: String(Math.round(height)),
      FORMAT: format,
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  private async fetchAndSaveImage(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WMS request failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('image/')) {
      const text = await response.text();
      throw new Error(`WMS returned non-image content-type: ${contentType}. Body: ${text.slice(0, 500)}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const tempDir = '/tmp';
    const filePath = path.join(tempDir, `wms-${uuidv4()}.png`);

    await Bun.write(filePath, arrayBuffer);

    return filePath;
  }
}
