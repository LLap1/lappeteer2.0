# @auto-document/logger

A Winston-based logging package for the Auto Document monorepo.

## Installation

This package is part of the monorepo workspace. No additional installation needed.

## Usage

### Standalone Usage

```typescript
import { createLogger, logger } from '@auto-document/logger';

// Use the default logger
logger.info('Application started');
logger.error('An error occurred', { error: err });

// Create a custom logger
const customLogger = createLogger({
  level: 'debug',
  defaultMeta: { service: 'my-service' },
});

customLogger.debug('Debug message');
```

### NestJS Integration

```typescript
import { LoggerModule } from '@auto-document/logger/nest';
import { Module } from '@nestjs/common';

@Module({
  imports: [LoggerModule],
})
export class AppModule {}
```

Then inject the logger service:

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@auto-document/logger/nest';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  doSomething() {
    this.logger.log('Doing something');
    this.logger.error('Error occurred', 'stack trace', 'MyService');
    this.logger.warn('Warning message');

    // Access the underlying Winston logger
    const winstonLogger = this.logger.getWinstonLogger();
    winstonLogger.info('Direct Winston call');
  }
}
```

## Configuration

The logger can be configured via environment variables:

- `LOG_LEVEL`: Set the log level (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`). Defaults to `info`.

## Features

- ✅ Winston-based logging
- ✅ JSON and console output formats
- ✅ Colorized console output
- ✅ Timestamp formatting
- ✅ Error stack trace support
- ✅ NestJS integration
- ✅ TypeScript support
