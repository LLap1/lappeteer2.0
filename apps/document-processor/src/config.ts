import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';
import packageJson from '../package.json';
import path from 'path';
import { DOCUMENTPROCESSOR_PACKAGE_NAME } from '@auto-document/types/proto/document-processor';
import { LoggerConfigSchema } from '@auto-document/nest/logger.module';
import { multistream } from 'pino';
import pinoElastic from 'pino-elasticsearch';
import pinoPretty from 'pino-pretty';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    host: z.string(),
    port: z.coerce.number(),
    packageName: z.string(),
    microserviceName: z.string(),
  }),
  ...LoggerConfigSchema.shape,
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT!),
    host: process.env.HOST!,
    packageName: DOCUMENTPROCESSOR_PACKAGE_NAME,
    microserviceName: packageJson.name.split('/').pop()!,
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

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
