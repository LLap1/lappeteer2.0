import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ELASTICSEARCH_NODE: z.string().url(),
  ELASTICSEARCH_USERNAME: z.string(),
  ELASTICSEARCH_PASSWORD: z.string(),
  ELASTICSEARCH_INDEX: z.string(),
  ELASTICSEARCH_SSL_REJECT_UNAUTHORIZED: z.coerce.boolean().default(true),
});

const env = envSchema.parse(process.env);

export default env;
