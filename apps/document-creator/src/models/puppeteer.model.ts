import { CreateDocumentInput, CreateDocumentOutput } from 'src/routers/documents/documents.router.schema';
import { Page } from 'puppeteer';
import { Geometry } from 'geojson';
import { base64ToFile, zipFiles } from './file.model';

export async function createDocuments(page: Page, inputs: CreateDocumentInput): Promise<CreateDocumentOutput> {
  await page.goto('http://localhost:8080');
  await runWindowFunction<{ poolSize: number }>(page, 'setPoolSize', {
    poolSize: inputs.length,
  });
  const files = await Promise.all(inputs.map((input, index) => createDocument(page, input, index + 1)));
  return zipFiles(files);
}

export async function createDocument(page: Page, input: CreateDocumentInput[number], index: number) {
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
  return base64ToFile(screenshotDataUrl, input.filename);
}

async function runWindowFunction<T, R = any>(page: Page, windowFunctionName: string, params?: T): Promise<R> {
  console.log('Running window function:', windowFunctionName, params);
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
