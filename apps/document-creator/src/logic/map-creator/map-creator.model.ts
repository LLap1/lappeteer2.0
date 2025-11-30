import { Feature, FeatureCollection, Geometry } from 'geojson';
import { PathOptions } from 'leaflet';
import { Page } from 'puppeteer';
import type { WindowActions } from '@auto-document/document-map-pool/routers/root';

export type CreateMapParams = {
  id: string;
  center: [number, number];
  zoom: number;
  width: number;
  height: number;
  geojson: Feature<Geometry, { style: PathOptions }>[];
};

export type Base64MapImage = string;

export type WindowAction<T extends WindowActions['type'] = WindowActions['type']> = Extract<WindowActions, { type: T }>;

export class WindowActionSender {
  constructor(private readonly page: Page) {}

  async send<T extends WindowActions['type']>(action: WindowAction<T>): Promise<any> {
    const result = await this.page.evaluate((action: WindowActions) => {
      console.log('evaluating action', action.type, window[action.type]);
      return window[action.type](action.params);
    }, action);
    return result as never;
  }
}
