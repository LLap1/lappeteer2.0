import { CreateDocumentInput, CreateDocumentOutput } from 'src/routers/documents/documents.router.schema';
import { Page } from 'puppeteer';
import { Geometry } from 'geojson';
import { base64ToFile, zipFiles } from './file.model';

export async function createDocuments(page: Page, inputs: CreateDocumentInput): Promise<CreateDocumentOutput> {
  await page.goto('http://localhost:8080');
  const ids = inputs.map((_, index) => `map-${index}`);
  await runWindowFunction<{ ids: string[] }>(page, 'createMapPool', { ids });
  const files = await Promise.all(inputs.map((input, index) => createDocument(page, input, ids[index])));
  return zipFiles(files);
}

export async function createDocument(page: Page, input: CreateDocumentInput[number], id: string) {
  await runMapFunction<{ id: string; url: string }>(page, id, 'addTileLayer', {
    id: 'tile-layer',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  });

  await runMapFunction<{ geojson: Geometry }>(page, id, 'addGeoJsonLayer', {
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

  await runMapFunction<{ center: [number, number]; zoom?: number }>(page, id, 'setView', {
    center: [51.505, -0.09],
    zoom: 13,
  });

  await runMapFunction<{ width: number; height: number }, void>(page, id, 'setMapSize', {
    width: 600,
    height: 600,
  });

  await runMapFunction<undefined, void>(page, id, 'waitForTilelayersToLoad');

  const screenshotDataUrl = await runMapFunction<undefined, string>(page, id, 'exportMap');
  return base64ToFile(screenshotDataUrl, input.filename);
}

async function runMapFunction<T, R = any>(page: Page, id: string, windowFunctionName: string, params?: T): Promise<R> {
  return runWindowFunction(page, `${id}-${windowFunctionName}`, params);
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
