import type { AnyContractRouter } from '@orpc/contract';
import { NestFactory } from '@nestjs/core';
import { RootModule } from '@auto-document/nest/root.module';
import { Type } from '@nestjs/common';
import node from '@auto-document/open-telemetry/node';
import { createLogger } from '@auto-document/logger';
import { NestLoggerAdapter } from '@auto-document/logger/nest-adapter';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { apiReference } from '@scalar/nestjs-api-reference';
import { generateOpenAPIDocument } from '@auto-document/orpc/open-api.docs';

export type ServerConfig = {
  server: {
    port: number;
    publicDir: string;
  };
  openApi: OpenAPIGeneratorGenerateOptions;
};

export interface ServeOptions {
  config: ServerConfig;
  rootRouter: AnyContractRouter;
  modules: Type<any>[];
}

export async function runServer({ config, modules, rootRouter }: ServeOptions) {
  node.start();

  const logger = createLogger();
  const nestLogger = new NestLoggerAdapter(logger);
  const app = await NestFactory.create(RootModule.forRoot(config, ...modules));
  const spec = await generateOpenAPIDocument(rootRouter, config.openApi);
  app.use(
    '/docs',
    apiReference({
      content: spec,
    }),
  );

  await app.listen(config.server.port);
  logger.info(`Server is running on port ${config.server.port}`);
}
