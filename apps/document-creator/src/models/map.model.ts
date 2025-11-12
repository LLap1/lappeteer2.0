import { Page } from 'puppeteer';
import { PuppeteerFunctionCaller } from './puppeteer.model';
import { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';

export class MapFunctionCaller extends PuppeteerFunctionCaller {
  constructor(page: Page, private readonly mapId: string) {
    super(page);
  }

  async addTileLayer(url: string) {
    return this.runMapFunction('addTileLayer', {
      url,
    });
  }

  async waitForTilelayersToLoad() {
    return this.runMapFunction('waitForTilelayersToLoad');
  }

  async addGeoJsonLayer(geojson: Feature<Geometry, { style: PathOptions }>) {
    return this.runMapFunction('addGeoJsonLayer', {
      geojson,
    });
  }

  async setView({ center, zoom }: { center: [number, number]; zoom?: number }) {
    return this.runMapFunction('setView', {
      center,
      zoom,
    });
  }

  async wait(seconds: number) {
    return this.runMapFunction('wait', {
      seconds,
    });
  }

  async exportMap() {
    return this.runMapFunction('exportMap');
  }

  private async runMapFunction<T, R = any>(windowFunctionName: string, params?: T): Promise<R> {
    return this.runWindowFunction(`${this.mapId}-${windowFunctionName}`, params);
  }
}
