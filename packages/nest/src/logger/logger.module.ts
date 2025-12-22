import { type DynamicModule, type Type } from '@nestjs/common';
import { Logger, LoggerModule as PinoNestLoggerModule } from 'nestjs-pino';
import { type DestinationStream } from 'pino';
import { z } from 'zod';

export const LoggerConfigSchema = z.object({
  logger: z.custom<LoggerConfigOptions>(),
});

export type LoggerConfigOptions = {
  pino: DestinationStream;
};
export class LoggerModule {
  static forRoot(config: LoggerConfigOptions): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      imports: [
        PinoNestLoggerModule.forRoot({
          pinoHttp: {
            stream: config.pino,
          },
        }),
      ],
      providers: [Logger],
      exports: [Logger],
    };
  }
}
