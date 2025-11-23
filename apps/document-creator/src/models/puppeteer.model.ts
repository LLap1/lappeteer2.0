import { Page } from 'puppeteer';

export class PageController {
  constructor(protected readonly page: Page) {}

  protected async runWindowFunction<T, R = any>(id: string, windowFunctionName: string, params?: T): Promise<R> {
    const result = await this.page.evaluate(
      (id, windowFunctionName, params) => {
        return window[id][windowFunctionName](params);
      },
      id,
      windowFunctionName,
      params,
    );
    return result;
  }
}
