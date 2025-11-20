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
  s3: z.object({
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    region: z.string(),
    endpoint: z.string(),
    bucket: z.string(),
  }),
  mongodb: z.object({
    uri: z.string().url(),
  }),
  documentDataCreator: z.object({
    type: documentDataCreatorTypeSchema,
  }),
  puppeteerDocumentCreateor: z.object({
    mapPoolUrl: z.string().url(),
    launchOptions: z.object({
      timeout: z.number().optional(),
      concurrency: z.number().min(Cluster.CONCURRENCY_PAGE).max(Cluster.CONCURRENCY_BROWSER),
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
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '4Um3zQvBYUaftOMG',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '6VJUXAC69Q6W5YbANvKpw3yReQ7M2YI1OJkyDrhP',
    region: process.env.S3_REGION ?? 'region',
    endpoint: process.env.S3_ENDPOINT ?? 'https://s3.tebi.io',
    bucket: process.env.S3_BUCKET ?? 'lapi',
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI ??
      'mongodb+srv://lapidotyonatan:n49E1ZQDy9ViuAM5@document.lfs17r0.mongodb.net/?appName=Document',
  },
  documentDataCreator: {
    type: (process.env.DOCUMENT_DATA_CREATOR_TYPE as DocumentDataCreatorType) ?? 'puppeteer',
  },
  puppeteerDocumentCreateor: {
    mapPoolUrl: process.env.MAP_POOL_URL ?? 'http://localhost:8080',
    launchOptions: {
      timeout: Number(process.env.PUPPETEER_TIMEOUT ?? 600000),
      concurrency: Number(process.env.PUPPETEER_CONCURRENCY ?? Cluster.CONCURRENCY_PAGE),
      maxConcurrency: Number(process.env.PUPPETEER_MAX_CONCURRENCY ?? 20),
      puppeteerOptions: {
        headless: Boolean(process.env.PUPPETEER_HEADLESS),
      },
    },
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
