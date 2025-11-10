import { Geometry } from 'geojson';
import { Page } from 'puppeteer';
import { PuppeteerFunctionCaller } from './puppeteer.model';

export class PageFucntionCaller extends PuppeteerFunctionCaller {
  constructor(page: Page) {
    super(page);
  }

  async goto(url: string) {
    return this.page.goto(url);
  }

  async createMapPool(ids: string[]) {
    return this.runWindowFunction('createMapPool', { ids });
  }
}
