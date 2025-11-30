import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import { join } from 'path';
import packageJson from '../package.json';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    publicDir: z.string(),
    port: z.number(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  templateFile: z.object({
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
    publicDir: process.env.PUBLIC_DIR ?? join(process.cwd(), 'src', 'public'),
    port: Number(process.env.PORT ?? 3001),
  },
  openApi: {
    title: process.env.OPEN_API_TITLE ?? packageJson.name,
    version: process.env.OPEN_API_VERSION ?? packageJson.version,
    description: process.env.OPEN_API_DESCRIPTION ?? packageJson.description,
  },
  templateFile: {
    url: process.env.TEMPLATE_FILE_URL ?? 'http://localhost:3002',
  },
  documentCreator: {
    url: process.env.DOCUMENT_CREATOR_URL ?? 'http://localhost:3000',
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
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
