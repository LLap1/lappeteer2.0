import type { FeatureCollection, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import type { WindowAction } from '@auto-document/document-map-pool/router';
import type { Page } from 'puppeteer';

export type CreateMapsInput = {
  id: string;
  width: number;
  height: number;
  intrestPolygonCollection: FeatureCollection<Geometry, { style?: PathOptions; text?: string } | null>;
  overlayId: string;
  rotation?: number;
}[];

export type ImageLayer = {
  path: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type CreateMapsOutput = {
  id: string;
  layers: ImageLayer[];
}[];

export class WindowActionSender {
  constructor(private readonly page: Page) {}

  async send(action: WindowAction): Promise<any> {
    const result = await this.page.evaluate((action: WindowAction) => {
      // @ts-ignore
      return window[action.type](action.params);
    }, action);
    return result as never;
  }
}
