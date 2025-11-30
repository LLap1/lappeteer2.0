import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

export const configSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  maps: z.object({
    maxParallelMaps: z.number(),
  }),
});

const templatedConfig: z.infer<typeof configSchema> = {
  server: {
    port: Number(process.env.PORT) || 8080,
  },
  maps: {
    maxParallelMaps: Number(process.env.MAX_PARALLEL_MAPS) || 10,
  },
};

export const config = configSchema.parse(templatedConfig);
export type Config = z.infer<typeof configSchema>;
