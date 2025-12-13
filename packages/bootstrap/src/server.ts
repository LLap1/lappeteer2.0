import type { AnyContractRouter } from '@orpc/contract';
import { NestFactory } from '@nestjs/core';
import type { Type } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { Logger } from 'nestjs-pino';

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
  const app = await NestFactory.create(appModule, {
    bodyParser: false,
  });

  app.useLogger(app.get(Logger));

  const spec = await generateOpenAPIDocument(appRouter, config.openApi);
  app.use(
    '/docs',
    apiReference({
      content: spec,
    }),
  );

  await app.listen(config.server.port);
  console.log(`Server is running on port ${config.server.port}`);
}

export async function generateOpenAPIDocument(router: AnyContractRouter, options: OpenAPIGeneratorGenerateOptions) {
  const openapiGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const spec = await openapiGenerator.generate(router, options);

  return spec;
}
