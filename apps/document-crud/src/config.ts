import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { CreateDocumentsInputSchema } from './documents/documents.router.schema';
import packageJson from '../package.json';
import { FileStorageConfigSchema } from '@auto-document/nest/file.module';
import { S3ConfigSchema } from '@auto-document/nest/s3.module';
loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
    baseUrl: z.url(),
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
  mongo: z.object({
    uri: z.string(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    baseUrl: process.env.BASE_URL!,
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
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
