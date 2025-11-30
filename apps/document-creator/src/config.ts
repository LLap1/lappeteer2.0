import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { Cluster } from 'puppeteer-cluster';
import packageJson from '../package.json';
loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  documentFileGenerator: z.object({
    url: z.string().url(),
  }),
  puppeteerDocumentCreateor: z.object({
    mapPoolUrl: z.string().url(),
    launchOptions: z.object({
      timeout: z.number().optional(),
      concurrency: z.number().min(Cluster.CONCURRENCY_PAGE).max(Cluster.CONCURRENCY_BROWSER),
      maxConcurrency: z.number(),
      puppeteerOptions: z.object({
        headless: z.boolean(),
        devtools: z.boolean(),
      }),
    }),
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
  puppeteerDocumentCreateor: {
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
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
