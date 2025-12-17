import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT) || 8080,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
