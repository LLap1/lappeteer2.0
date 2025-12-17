import { type DynamicModule, type Type } from '@nestjs/common';
import { Logger, LoggerModule as PinoNestLoggerModule } from 'nestjs-pino';
import { type DestinationStream } from 'pino';
import { config, z } from 'zod';

export const LoggerConfigSchema = z.object({
  logger: z.object({
    pino: z.custom<DestinationStream>(),
  }),
});

export type LoggerConfig = z.infer<typeof LoggerConfigSchema>;

export class LoggerModule {
  static forRootAsync({
    inject,
    useFactory,
  }: {
    inject: Type[];
    useFactory: (...args: any[]) => DestinationStream;
  }): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      imports: [
        PinoNestLoggerModule.forRootAsync({
          inject,
          useFactory: (...args: any[]) => ({
            pinoHttp: {
              stream: useFactory(...args),
            },
          }),
        }),
      ],
      providers: [Logger],
      exports: [Logger],
    };
  }
}
