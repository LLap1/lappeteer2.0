import { type Log, Logger, type LogSchema } from '@auto-document/types/logs';
import type { TRPCClient } from '@trpc/client';
import type { LoggerRouter } from '@auto-document/trpc/logger';
import type { z } from 'zod';

export class TRPCLogger extends Logger {
  constructor(private trpcLoggerClient: TRPCClient<LoggerRouter>) {
    super();
  }

  log(log: Log) {
    this.trpcLoggerClient.log.mutate(log as z.infer<typeof LogSchema>);
  }
}
