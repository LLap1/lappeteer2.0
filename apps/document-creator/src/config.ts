import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

const documentCreatorTypeSchema = z.enum(['puppeteer']);
type DocumentCreatorType = z.infer<typeof documentCreatorTypeSchema>;

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  documentCreator: z.object({
    type: documentCreatorTypeSchema,
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT) || 8080,
  },
  documentCreator: {
    type: (process.env.DOCUMENT_CREATOR_TYPE as DocumentCreatorType) || 'puppeteer',
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
