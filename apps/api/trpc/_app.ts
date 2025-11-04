import { root } from './init';
import { exampleRouter } from '@zohan/trpc/example';
import { loggerRouter } from '@zohan/trpc/logger';
import { logger } from '../logger/logger';

export const appRouter = root.router({
  example: exampleRouter(root),
  logger: loggerRouter(root, logger),
});

export type AppRouter = typeof appRouter;
