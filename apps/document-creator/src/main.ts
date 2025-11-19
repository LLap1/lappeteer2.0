import { AppModule } from './logic/app.module';
import apiReference from '@scalar/fastify-api-reference';
import { generateOpenAPIDocument } from './docs/open-api.docs';
import Fastify from 'fastify';
import { config } from './config';
import { NestFactory } from '@nestjs/core';
import openApiHandler from 'src/orpc/handlers/open-api.handler';
import rpcHandler from 'src/orpc/handlers/rpc.handler';
import { INestApplication } from '@nestjs/common';
import multipart from '@fastify/multipart';

let nest: INestApplication;

NestFactory.create(AppModule).then(async appInstance => {
  nest = appInstance;
  await nest.init();
});

const server = Fastify();

server.register(multipart);

server.addContentTypeParser('*', (request, payload, done) => {
  done(null, undefined);
});

server.register(apiReference, {
  routePrefix: '/docs',
  configuration: {
    url: '/openapi-spec.json',
  },
});

server.get('/openapi-spec.json', async (request, reply) => {
  return generateOpenAPIDocument();
});

server.get('/health', async (req, reply) => {
  reply.status(200).send({
    status: 'ok',
  });
});

server.all('/api/*', async (req, reply) => {
  req.headers['accept-encoding'] = 'df';
  const { matched } = await openApiHandler.handle(req, reply, {
    context: {
      reply,
      nest,
    },

    prefix: '/api',
  });

  if (!matched) {
    reply.status(404).send('Not found');
  }
});

server.all('/rpc/*', async (req, reply) => {
  const { matched } = await rpcHandler.handle(req, reply, {
    context: {
      reply,
      nest,
    },
    prefix: '/rpc',
  });

  if (!matched) {
    reply.status(404).send('Not found');
  }
});

server.listen({ port: config.server.port }).then(() => {
  console.log(`Server is running on port ${config.server.port}`);
});
