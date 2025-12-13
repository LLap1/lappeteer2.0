import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';
import path from 'path';
import { DOCUMENTPROCESSOR_PACKAGE_NAME } from '@auto-document/types/proto/document-processor';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    host: z.string(),
    port: z.coerce.number(),
    packageName: z.string(),
    microserviceName: z.string(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    host: process.env.HOST!,
    packageName: DOCUMENTPROCESSOR_PACKAGE_NAME,
    microserviceName: packageJson.name.split('/').pop()!,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
