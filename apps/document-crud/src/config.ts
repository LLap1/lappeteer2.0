import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { CreateDocumentsInputSchema } from './documents/documents.router.schema';
import packageJson from '../package.json';
import { FileStorageConfigSchema } from '@auto-document/nest/file.module';
import { S3ConfigSchema } from '@auto-document/nest/s3.module';
import { FileStorageType } from '@auto-document/nest/file.module';
loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    commonSchemas: z.record(z.string(), z.object({ schema: z.any() })),
  }),
  documentProcessor: z.object({
    url: z.url(),
  }),
  documentMapCreator: z.object({
    url: z.url(),
  }),
  ...S3ConfigSchema.shape,
  ...FileStorageConfigSchema.shape,
  mongo: z.object({
    uri: z.string(),
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
    commonSchemas: {
      CreateDocumentsInput: { schema: CreateDocumentsInputSchema },
    },
  },
  documentProcessor: {
    url: process.env.DOCUMENT_PROCESSOR!,
  },
  documentMapCreator: {
    url: process.env.DOCUMENT_MAP_CREATOR_URL!,
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    bucket: process.env.S3_BUCKET!,
  },
  fileStorage: {
    type: process.env.FILE_STORAGE_TYPE! as FileStorageType,
  },
  mongo: {
    uri: process.env.MONGODB_URI!,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
