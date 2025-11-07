import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { Cluster } from 'puppeteer-cluster';

loadDotenv();

const documentCreatorTypeSchema = z.enum(['puppeteer']);
type DocumentCreatorType = z.infer<typeof documentCreatorTypeSchema>;

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  documentCreator: z.object({
    type: documentCreatorTypeSchema,
  }),
  puppeteerDocumentCreateor: z.object({
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
    port: Number(process.env.PORT) || 8080,
  },
  documentCreator: {
    type: (process.env.DOCUMENT_CREATOR_TYPE as DocumentCreatorType) || 'puppeteer',
  },
  puppeteerDocumentCreateor: {
    launchOptions: {
      concurrency: Number(process.env.PUPPETEER_CONCURRENCY) || Cluster.CONCURRENCY_PAGE,
      maxConcurrency: Number(process.env.PUPPETEER_MAX_CONCURRENCY) || 8,
      puppeteerOptions: {
        headless: process.env.PUPPETEER_HEADLESS === 'true',
      },
    },
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
