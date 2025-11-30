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
  templateCrud: z.object({
    url: z.string().url(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    publicDir: process.env.PUBLIC_DIR ?? join(process.cwd(), 'src', 'public'),
    port: Number(process.env.PORT ?? 3002),
  },
  templateCrud: {
    url: process.env.TEMPLATE_CRUD_URL ?? 'http://localhost:3001',
  },
  openApi: {
    title: process.env.OPEN_API_TITLE ?? packageJson.name,
    version: process.env.OPEN_API_VERSION ?? packageJson.version,
    description: process.env.OPEN_API_DESCRIPTION ?? packageJson.description,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
