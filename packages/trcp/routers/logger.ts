import { LogSchema, type Log, type Logger } from '@auto-doucment/types/logs';
import { type TRPCRootObject } from '@trpc/server';

export function loggerRouter<TContext extends object, TMeta extends object>(
  root: TRPCRootObject<TContext, TMeta, any, any>,
  logger: Logger,
) {
  return root.router({
    log: root.procedure.input(LogSchema).mutation(({ input }) => {
      return logger.log(input as Log);
    }),
  });
}

export type LoggerRouter = ReturnType<typeof loggerRouter>;
