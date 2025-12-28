import type { AnyContractRouter } from '@orpc/contract';
import { NestFactory } from '@nestjs/core';
import type { Type } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { WinstonModule } from 'nest-winston';
import winston, { log } from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { z } from 'zod';

export const ServerConfigSchema = z.object({
  server: z.object({
    port: z.number(),
    serviceName: z.string(),
    version: z.string(),
    env: z.string(),
  }),
  logger: z.object({
    elasticsearch: z.object({
      node: z.string(),
      isDataStream: z.boolean(),
      index: z.string(),
      username: z.string(),
      password: z.string(),
      tls: z.object({
        rejectUnauthorized: z.boolean(),
      }),
    }),
  }),
  openApi: z.custom<OpenAPIGeneratorGenerateOptions>(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export interface ServeOptions {
  config: ServerConfig;
  appRouter: AnyContractRouter;
  appModule: Type<any>;
}

export async function runCrud({ config, appModule, appRouter }: ServeOptions) {
  const logger = createLogger(config);

  const app = await NestFactory.create(appModule, {
    bodyParser: false,
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
  });

  const spec = await generateOpenAPIDocument(appRouter, config.openApi);
  app.use(
    '/docs',
    apiReference({
      content: spec,
      cdn: '/api-reference-cdn.js',
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

function createLogger(config: ServerConfig) {
  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(winston.format.simple(), winston.format.prettyPrint()),
  });
  const eckTransport = new ElasticsearchTransport({
    format: ecsFormat({
      convertReqRes: true,
      apmIntegration: true,
      serviceName: config.server.serviceName,
      serviceVersion: config.server.version,
      serviceEnvironment: config.server.env,
    }),
    clientOpts: {
      node: config.logger.elasticsearch.node,
      auth: {
        username: config.logger.elasticsearch.username,
        password: config.logger.elasticsearch.password,
      },
      tls: {
        rejectUnauthorized: config.logger.elasticsearch.tls.rejectUnauthorized,
      },
    },
    index: config.logger.elasticsearch.index,
    dataStream: config.logger.elasticsearch.isDataStream,
  });

  const logger = winston.createLogger({
    transports: [consoleTransport, eckTransport],
  });

  return logger;
}
