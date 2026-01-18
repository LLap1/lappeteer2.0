import { z } from 'zod';

export const EnvironmentSchema = z.enum(['production', 'development', 'test']);
export type Environment = z.infer<typeof EnvironmentSchema>;
