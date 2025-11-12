import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { Cluster } from 'puppeteer-cluster';

loadDotenv();

const documentDataCreatorTypeSchema = z.enum(['puppeteer']);
type DocumentDataCreatorType = z.infer<typeof documentDataCreatorTypeSchema>;

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  documentDataCreator: z.object({
    type: documentDataCreatorTypeSchema,
  }),
  puppeteerDocumentCreateor: z.object({
    mapPoolUrl: z.string().url(),
    launchOptions: z.object({
      concurrency: z.number().min(Cluster.CONCURRENCY_PAGE).max(Cluster.CONCURRENCY_CONTEXT),
      maxConcurrency: z.number(),
      puppeteerOptions: z.object({
        headless: z.boolean(),
      }),
    }),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT ?? 3000),
  },
  documentDataCreator: {
    type: (process.env.DOCUMENT_DATA_CREATOR_TYPE as DocumentDataCreatorType) ?? 'puppeteer',
  },
  puppeteerDocumentCreateor: {
    mapPoolUrl: process.env.MAP_POOL_URL ?? 'http://localhost:8080',
    launchOptions: {
      concurrency: Number(process.env.PUPPETEER_CONCURRENCY ?? Cluster.CONCURRENCY_PAGE),
      maxConcurrency: Number(process.env.PUPPETEER_MAX_CONCURRENCY ?? 8),
      puppeteerOptions: {
        headless: Boolean(process.env.PUPPETEER_HEADLESS),
      },
    },
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
