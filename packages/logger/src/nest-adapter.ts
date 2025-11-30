import type { LoggerService } from '@nestjs/common';
import type { Logger as WinstonLogger } from 'winston';

export class NestLoggerAdapter implements LoggerService {
  constructor(private readonly logger: WinstonLogger) {}

  log(message: string, ...optionalParams: unknown[]): void {
    this.logger.info(message, ...optionalParams);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    this.logger.verbose(message, ...optionalParams);
  }
}
