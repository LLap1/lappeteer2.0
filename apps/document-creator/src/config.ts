import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { Cluster } from 'puppeteer-cluster';
import { join } from 'path';
import packageJson from '../package.json';
loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
    publicDir: z.string(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  templateFile: z.object({
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
    port: Number(process.env.PORT ?? 3000),
    publicDir: process.env.PUBLIC_DIR ?? join(process.cwd(), 'src', 'public'),
  },
  openApi: {
    title: process.env.OPEN_API_TITLE ?? packageJson.name,
    version: process.env.OPEN_API_VERSION ?? packageJson.version,
    description: process.env.OPEN_API_DESCRIPTION ?? packageJson.description,
  },
  templateFile: {
    url: process.env.TEMPLATE_FILE_URL ?? 'http://localhost:3002',
  },
  puppeteerDocumentCreateor: {
    mapPoolUrl: process.env.MAP_POOL_URL ?? 'http://localhost:8080',
    launchOptions: {
      timeout: Number(process.env.PUPPETEER_TIMEOUT ?? 600000),
      concurrency: Number(process.env.PUPPETEER_CONCURRENCY ?? Cluster.CONCURRENCY_CONTEXT),
      maxConcurrency: Number(process.env.PUPPETEER_MAX_CONCURRENCY ?? 20),
      puppeteerOptions: {
        headless: Boolean(process.env.PUPPETEER_HEADLESS),
        devtools: Boolean(process.env.PUPPETEER_DEVTOOLS ?? true),
      },
    },
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
