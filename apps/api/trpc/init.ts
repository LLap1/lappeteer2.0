import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';

export const root = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = root.router;
export const publicProcedure = root.procedure;
