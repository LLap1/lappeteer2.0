import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
  }),
  openApi: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
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
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
