import { Global, Module } from '@nestjs/common';
import { Logger, LoggerModule as PinoNestLoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Global()
@Module({
  imports: [
    PinoNestLoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: { singleLine: false, colorize: true },
            },
            {
              target: 'pino-elasticsearch',
              options: {
                singleLine: true,
                colorize: false,
                index: 'an-index',
                node: 'http://localhost:9200',
                esVersion: 7,
                flushBytes: 1000,
              },
            },
          ],
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
