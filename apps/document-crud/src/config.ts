import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { CreateDocumentsInputSchema } from './logic/document/documents.router.schema';
import packageJson from '../package.json';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    commonSchemas: z.record(z.string(), z.object({ schema: z.any() })),
  }),
  templateAnalyzer: z.object({
    url: z.string().url(),
  }),
  documentCreator: z.object({
    url: z.string().url(),
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
  templateAnalyzer: {
    url: process.env.TEMPLATE_ANALYZER_URL!,
  },
  documentCreator: {
    url: process.env.DOCUMENT_CREATOR_URL!,
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    bucket: process.env.S3_BUCKET!,
  },
  mongodb: {
    uri: process.env.MONGODB_URI!,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
