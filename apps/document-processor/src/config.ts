import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';
import path from 'path';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    host: z.string(),
    port: z.coerce.number(),
    appName: z.string(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    host: process.env.HOST!,
    appName: packageJson.name.split('/').pop()!,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
