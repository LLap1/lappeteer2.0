import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';
import { S3ConfigSchema } from '@auto-document/nest/s3.module';
import { LoggerConfigSchema } from '@auto-document/nest/logger.module';
import { multistream } from 'pino';
import pinoElastic from 'pino-elasticsearch';
import pinoPretty from 'pino-pretty';
import { DrizzleConfigSchema } from '@auto-document/nest/drizzle.module';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { Cluster } from 'puppeteer-cluster';
loadDotenv();

export const EnvironmentSchema = z.enum(['production', 'development', 'test']);
export type Environment = z.infer<typeof EnvironmentSchema>;
export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
    baseUrl: z.url(),
    environment: EnvironmentSchema.default('development'),
  }),
  openApi: z.custom<OpenAPIGeneratorGenerateOptions>(),
  mapCreator: z.object({
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

  ...S3ConfigSchema.shape,
  ...LoggerConfigSchema.shape,
  ...DrizzleConfigSchema.shape,
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    baseUrl: process.env.BASE_URL!,
    environment: process.env.ENV as Environment,
  },
  openApi: {
    info: {
      title: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    },
  },
  documentMapCreator: {
    host: process.env.DOCUMENT_MAP_CREATOR_HOST!,
    port: Number(process.env.DOCUMENT_MAP_CREATOR_PORT!),
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
  mapCreator: {
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
  logger: {
    pino: multistream([
      process.env.ENV === 'produciton'
        ? pinoElastic({
            index: process.env.ELASTICSEARCH_INDEX!,
            node: process.env.ELASTICSEARCH_NODE!,
            esVersion: Number(process.env.ELASTICSEARCH_ES_VERSION!),
          })
        : pinoPretty({
            colorize: true,
            singleLine: false,
          }),
    ]),
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
