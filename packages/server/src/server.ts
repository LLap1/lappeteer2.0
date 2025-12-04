import type { AnyContractRouter } from '@orpc/contract';
import { NestFactory } from '@nestjs/core';
import { Type } from '@nestjs/common';
import node from '@auto-document/open-telemetry/node';
import { createLogger } from '@auto-document/logger';
import { NestLoggerAdapter } from '@auto-document/logger/nest-adapter';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { apiReference } from '@scalar/nestjs-api-reference';
import { generateOpenAPIDocument } from '@auto-document/orpc/utils/open-api';

export type ServerConfig = {
  server: {
    port: number;
  };
  openApi: OpenAPIGeneratorGenerateOptions;
};

export interface ServeOptions {
  config: ServerConfig;
  appRouter: AnyContractRouter;
  appModule: Type<any>;
}

export async function runServer({ config, appModule, appRouter }: ServeOptions) {
  const logger = createLogger();
  const nestLogger = new NestLoggerAdapter(logger);
  const app = await NestFactory.create(appModule, {
    bodyParser: false,
  });
  
  const spec = await generateOpenAPIDocument(appRouter, config.openApi);
  app.use(
    '/docs',
    apiReference({
      content: spec,
    }),
  );

  await app.listen(config.server.port);
  logger.info(`Server is running on port ${config.server.port}`);
}
