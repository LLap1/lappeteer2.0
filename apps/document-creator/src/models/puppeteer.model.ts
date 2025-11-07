import { CreateDocumentInput } from 'src/routers/documents/documents.router.schema';
import { delay, forkJoin, map, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { Page } from 'puppeteer';
import { Geometry } from 'geojson';

export async function createScreenshot(page: Page) {
  await page.goto('http://localhost:8080');

  await runWindowFunction<{ id: string; url: string }>(page, 'addTileLayer', {
    id: 'tile-layer',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  });

  await runWindowFunction<{ geojson: Geometry }>(page, 'addGeoJsonLayer', {
    geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [51.516653629684214, -0.09490097131637754],
          [51.51364035099729, -0.08794682905013929],
          [51.516653629684214, -0.08794682905013929],
          [51.516653629684214, -0.09490097131637754],
        ],
      ],
    },
  });
  await runWindowFunction<{ center: [number, number]; zoom?: number }>(page, 'setView', {
    center: [51.505, -0.09],
    zoom: 13,
  });

  await runWindowFunction<{ width: number; height: number }, void>(page, 'setMapSize', {
    width: 600,
    height: 600,
  });

  await runWindowFunction<undefined, void>(page, 'waitForTilelayersToLoad');

  const screenshotDataUrl = await runWindowFunction<undefined, string>(page, 'exportMap');
  const base64 = screenshotDataUrl.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const screenshot = new File([blob], 'screenshot.png', { type: 'image/png' });
  return screenshot;
}

async function runWindowFunction<T, R = any>(page: Page, windowFunctionName: string, params?: T): Promise<R> {
  const result = await page.evaluate(
    (windowFunctionName, params) => {
      console.log(windowFunctionName, params);
      return window[windowFunctionName](params);
    },
    windowFunctionName,
    params,
  );
  return result;
}
