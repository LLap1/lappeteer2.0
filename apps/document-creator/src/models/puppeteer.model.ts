import { CreateDocumentInput } from 'src/routers/documents/documents.router.schema';
import { Observable, of, pipe } from 'rxjs';
import { Page } from 'puppeteer';
import z from 'zod';

export const createDocumentPipeline = (page: Page, input: CreateDocumentInput) => {
  return of(input).pipe(visitWebsite(page, input.url), takeScreenshot(page));
};

export const waitForSelector = (page: Page, selector: string) => {
  return function <T>(source: Observable<T>): Observable<void> {
    return new Observable(subscriber => {
      source.subscribe({
        async next() {
          await page.waitForSelector(selector);
          subscriber.next(undefined);
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  };
};

export const takeScreenshot = (page: Page) => {
  return function <T>(source: Observable<T>): Observable<Uint8Array> {
    return new Observable(subscriber => {
      source.subscribe({
        async next() {
          const screenshot = await page.screenshot({ path: 'screenshot.png', fullPage: true });
          subscriber.next(screenshot);
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  };
};

export function visitWebsite<T>(page: Page, url: string) {
  return function <T>(source: Observable<T>): Observable<void> {
    return new Observable(subscriber => {
      source.subscribe({
        async next() {
          await page.goto(url);
          subscriber.next(undefined);
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  };
}
