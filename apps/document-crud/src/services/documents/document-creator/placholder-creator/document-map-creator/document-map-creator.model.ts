import { Page } from 'puppeteer';
import type { WindowAction } from '@auto-document/document-map-pool/routers/root';
import { PathOptions } from 'leaflet';
import { Feature } from 'geojson';
import { Geometry } from 'geojson';

export interface MapParams {
  id: string;
  width: number;
  height: number;
  center: number[];
  zoom: number;
  geojson: Feature<Geometry, { style: PathOptions }>[];
}

export type CreateMapsInput = {
  id: string;
  width: number;
  height: number;
  center: [number, number];
  zoom: number;
  geojson: any[];
}[];

export type CreateMapsOutput = {
  id: string;
  layerDataUrls: string[];
}[];

export class WindowActionSender {
  constructor(private readonly page: Page) {}

  async send(action: WindowAction): Promise<any> {
    const result = await this.page.evaluate((action: WindowAction) => {
      return window[action.type](action.params);
    }, action);
    return result as never;
  }
}
