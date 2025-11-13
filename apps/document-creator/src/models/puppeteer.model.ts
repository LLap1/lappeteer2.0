import { Page } from 'puppeteer';
import { Geometry } from 'geojson';
import { base64ToFile, zipFiles } from './file.model';
import { config } from 'src/config';
import { PageFucntionCaller } from './page.model';

export class PuppeteerFunctionCaller {
  constructor(protected readonly page: Page) {}

  protected async runWindowFunction<T, R = any>(windowFunctionName: string, params?: T): Promise<R> {
    const result = await this.page.evaluate(
      (windowFunctionName, params) => {
        return window[windowFunctionName](params);
      },
      windowFunctionName,
      params,
    );
    return result;
  }
}
