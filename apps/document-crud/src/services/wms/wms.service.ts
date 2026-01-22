import type { BuildWmsUrlInput, GetMapInput, GetMapOutput } from './wms.model';
import type { OverlaysService } from './overlays/overlays.service';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export abstract class WmsService {
  constructor(protected readonly overlaysService: OverlaysService) {}

  async getMap(input: GetMapInput): Promise<GetMapOutput> {
    const overlay = await this.overlaysService.getById({ id: input.overlayId });
    const url = this.buildWmsUrl({
      ...input,
      streamingUrl: overlay.streamingUrl,
    });
    const imageFile = await this.fetchAndSaveImage(url);

    return { imageFile };
  }

  protected abstract buildWmsUrl(input: BuildWmsUrlInput): string;

  private async fetchAndSaveImage(url: string): Promise<Bun.BunFile> {
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

    const file =  Bun.file(filePath);
    await file.write(arrayBuffer);

    return file;
  }
}
