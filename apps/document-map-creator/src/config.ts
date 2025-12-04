import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { Cluster } from 'puppeteer-cluster';
import packageJson from '../package.json';
loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  documentFileGenerator: z.object({
    url: z.string().url(),
  }),
  MapCreator: z.object({
    orthoTileLayerUrl: z.url(),
    mapPoolUrl: z.string().url(),
    launchOptions: z.object({
      timeout: z.coerce.number().optional(),
      concurrency: z.coerce.number().min(Cluster.CONCURRENCY_PAGE).max(Cluster.CONCURRENCY_BROWSER),
      maxConcurrency: z.coerce.number(),
      puppeteerOptions: z.object({
        headless: z.boolean(),
        devtools: z.boolean(),
      }),
    }),
    mapsPerPage: z.coerce.number(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
  },
  openApi: {
    title: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  },
  documentFileGenerator: {
    url: process.env.DOCUMENT_FILE_GENERATOR_URL!,
  },
  MapCreator: {
    orthoTileLayerUrl: process.env.ORTHO_TILE_LAYER_URL!,
    mapPoolUrl: process.env.MAP_POOL_URL!,
    launchOptions: {
      timeout: process.env.PUPPETEER_TIMEOUT ? Number(process.env.PUPPETEER_TIMEOUT) : undefined,
      concurrency: Number(process.env.PUPPETEER_CONCURRENCY!),
      maxConcurrency: Number(process.env.PUPPETEER_MAX_CONCURRENCY!),
      puppeteerOptions: {
        headless: process.env.PUPPETEER_HEADLESS === 'true',
        devtools: process.env.PUPPETEER_DEVTOOLS === 'true',
      },
    },
    mapsPerPage: Number(process.env.MAPS_PER_PAGE!),
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
