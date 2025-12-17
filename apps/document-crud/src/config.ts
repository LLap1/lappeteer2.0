import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { CreateDocumentsInputSchema } from './documents/documents.router.schema';
import packageJson from '../package.json';
import { S3ConfigSchema } from '@auto-document/nest/s3.module';
import { LoggerConfigSchema } from '@auto-document/nest/logger.module';
import { multistream } from 'pino';
import pinoElastic from 'pino-elasticsearch';
import pinoPretty from 'pino-pretty';

loadDotenv();

export const EnvironmentSchema = z.enum(['production', 'development', 'test']);
export type Environment = z.infer<typeof EnvironmentSchema>;
export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
    baseUrl: z.url(),
    environment: EnvironmentSchema.default('development'),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    commonSchemas: z.record(z.string(), z.object({ schema: z.any() })),
  }),
  documentProcessor: z.object({
    host: z.string(),
    port: z.coerce.number(),
  }),
  documentMapCreator: z.object({
    host: z.string(),
    port: z.coerce.number(),
  }),
  ...S3ConfigSchema.shape,
  ...LoggerConfigSchema.shape,
  mongo: z.object({
    uri: z.string(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    baseUrl: process.env.BASE_URL!,
    environment: process.env.ENV as Environment,
  },
  openApi: {
    title: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    commonSchemas: {
      CreateDocumentsInput: { schema: CreateDocumentsInputSchema },
    },
  },
  documentProcessor: {
    host: process.env.DOCUMENT_PROCESSOR_HOST!,
    port: Number(process.env.DOCUMENT_PROCESSOR_PORT!),
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
  mongo: {
    uri: process.env.MONGODB_URI!,
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
console.log(process.env.ENV);
export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
