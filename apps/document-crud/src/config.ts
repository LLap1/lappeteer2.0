import { z } from 'zod/v4';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';
import { S3ConfigSchema } from '@auto-document/nest/s3.module';
import { DrizzleConfigSchema } from '@auto-document/nest/drizzle.module';
import { ServerConfigSchema } from '@auto-document/bootstrap/crud';
import type { ClusterOptions } from 'puppeteer-cluster';

loadDotenv();

export const EnvironmentSchema = z.enum(['production', 'development', 'test']);
export type Environment = z.infer<typeof EnvironmentSchema>;
export const configSchema = z.object({
  documentProcessor: z.object({
    scriptsPath: z.string(),
  }),
  overlaysService: z.object({
    type: z.string(),
  }),
  wmsService: z.object({
    type: z.string(),
    baseUrl: z.string(),
  }),

  documentMapCreator: z.object({
    mapPoolUrl: z.string(),
    mapsPerPage: z.number(),
    launchOptions: z.object({
      timeout: z.number(),
      concurrency: z.number(),
      maxConcurrency: z.number(),
      puppeteerOptions: z.object({
        headless: z.boolean(),
        devtools: z.boolean(),
      }),
    }),
  }),
  ...S3ConfigSchema.shape,
  ...ServerConfigSchema.shape,
  ...DrizzleConfigSchema.shape,
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    serviceName: packageJson.name,
    version: packageJson.version,
    env: process.env.ENV!,
  },
  logger: {
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE!,
      isDataStream: process.env.ELASTICSEARCH_IS_DATA_STREAM === 'true',
      index: process.env.ELASTICSEARCH_INDEX!,
      username: process.env.ELASTICSEARCH_USERNAME!,
      password: process.env.ELASTICSEARCH_PASSWORD!,
      tls: {
        rejectUnauthorized: process.env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED === 'true',
      },
    },
  },
  openApi: {
    info: {
      title: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    },
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    bucket: process.env.S3_BUCKET!,
  },
  drizzle: {
    connectionString: process.env.DRIZZLE_CONNECTION_STRING!,
  },
  documentProcessor: {
    scriptsPath: process.env.DOCUMENT_PROCESSOR_SCRIPTS_PATH!,
  },
  overlaysService: {
    type: process.env.OVERLAYS_SERVICE_TYPE! as z.infer<typeof configSchema.shape.overlaysService.shape.type>,
  },
  wmsService: {
    type: process.env.WMS_SERVICE_TYPE! as z.infer<typeof configSchema.shape.wmsService.shape.type>,
    baseUrl: process.env.WMS_SERVICE_BASE_URL!,
  },
  documentMapCreator: {
    mapPoolUrl: process.env.MAP_POOL_URL!,
    mapsPerPage: Number(process.env.MAPS_PER_PAGE!),
    launchOptions: {
      timeout: Number(process.env.PUPPETEER_TIMEOUT!),
      concurrency: Number(process.env.PUPPETEER_CONCURRENCY!),
      maxConcurrency: Number(process.env.PUPPETEER_MAX_CONCURRENCY!),
      puppeteerOptions: {
        headless: process.env.PUPPETEER_HEADLESS! === 'true',
        devtools: process.env.PUPPETEER_DEVTOOLS! === 'true',
      },
    },
  },
};

export const config = configSchema.parse(templatedConfig);

export type Config = z.infer<typeof configSchema>;
