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

  async createMapPool(inputs: { id: string; width: number; height: number }[]) {
    return this.runWindowFunction('createMapPool', inputs);
  }
}
