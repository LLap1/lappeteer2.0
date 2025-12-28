import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';
import { S3ConfigSchema } from '@auto-document/nest/s3.module';
import { DrizzleConfigSchema } from '@auto-document/nest/drizzle.module';
import { Cluster } from 'puppeteer-cluster';
import { ServerConfigSchema } from '@auto-document/bootstrap/crud';

loadDotenv();

export const EnvironmentSchema = z.enum(['production', 'development', 'test']);
export type Environment = z.infer<typeof EnvironmentSchema>;
export const configSchema = z.object({
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
};

export const config = configSchema.parse(templatedConfig);

export type Config = z.infer<typeof configSchema>;
