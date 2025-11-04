import { AppModule } from './logic/app.module';
import apiReference from '@scalar/fastify-api-reference';
import { generateOpenAPIDocument } from './docs/open-api.docs';
import { root } from './routers/root.router';
import Fastify from 'fastify';
import { config } from './config';
import { NestFactory } from '@nestjs/core';
import { OpenAPIHandler } from '@orpc/openapi/fastify';
import { RPCHandler } from '@orpc/server/fastify';
import { INestApplication } from '@nestjs/common';

export let nest: INestApplication;

NestFactory.create(AppModule).then(async appInstance => {
  nest = appInstance;
  nest.init();
});

const server = Fastify();

server.addContentTypeParser('*', (request, payload, done) => {
  //using the orpc parsing
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

const openApiHandler = new OpenAPIHandler(root);
server.all('/api/*', async (req, reply) => {
  req.headers['accept-encoding'] = 'df';
  const { matched } = await openApiHandler.handle(req, reply, {
    context: {
      headers: req.headers as Record<string, string>,
    },
    prefix: '/api',
  });

  if (!matched) {
    reply.status(404).send('Not found');
  }
});

const rpcHandler = new RPCHandler(root);
server.all('/rpc/*', async (req, reply) => {
  const { matched } = await rpcHandler.handle(req, reply, {
    context: {
      headers: req.headers as Record<string, string>,
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
