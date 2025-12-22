import { type DynamicModule } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

export const DRIZZLE = Symbol('DRIZZLE');

export const DrizzleOptionsSchema = z.object({
  connectionString: z.string(),
});
export const DrizzleConfigSchema = z.object({
  drizzle: DrizzleOptionsSchema,
});

export type DrizzleConfig = z.infer<typeof DrizzleConfigSchema>;
export type DrizzleOptions = z.infer<typeof DrizzleOptionsSchema>;

export class DrizzleModule {
  static forRoot(config: DrizzleOptions): DynamicModule {
    const client = postgres(config.connectionString);
    const db = drizzle(client);

    return {
      global: true,
      module: DrizzleModule,
      providers: [
        {
          provide: DRIZZLE,
          useValue: db,
        },
      ],
      exports: [DRIZZLE],
    };
  }
}

export type DrizzleDB<TSchema extends Record<string, unknown> = Record<string, unknown>> = PostgresJsDatabase<TSchema>;
