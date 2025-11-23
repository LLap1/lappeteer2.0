import { AppModule } from './logic/app.module';
import { generateOpenAPIDocument } from './docs/open-api.docs';
import { config } from './config';
import { NestFactory } from '@nestjs/core';
import openApiHandler from 'src/orpc/handlers/open-api.handler';
import rpcHandler from 'src/orpc/handlers/rpc.handler';
import { INestApplication } from '@nestjs/common';

let nest: INestApplication;

NestFactory.create(AppModule).then(async appInstance => {
  nest = appInstance;
  await nest.init();
});

const scalarHtml = `
<!doctype html>
<html>
  <head>
    <title>API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi-spec.json"
      type="application/json"
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest"></script>
  </body>
</html>
`;

Bun.serve({
  port: config.server.port,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === '/health') {
      return Response.json({ status: 'ok' });
    }

    if (pathname === '/openapi-spec.json') {
      const spec = await generateOpenAPIDocument();
      return Response.json(spec);
    }

    if (pathname === '/docs' || pathname === '/docs/') {
      return new Response(scalarHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (pathname.startsWith('/api/')) {
      const modifiedHeaders = new Headers(req.headers);
      modifiedHeaders.set('accept-encoding', 'df');

      const modifiedRequest = new Request(req.url, {
        method: req.method,
        headers: modifiedHeaders,
        body: req.body,
      });

      const response = await openApiHandler.handle(modifiedRequest, {
        context: {
          request: modifiedRequest,
          nest,
        },
        prefix: '/api',
      });

      if (!response.matched) {
        return new Response('Not found', { status: 404 });
      }

      return response.response;
    }

    if (pathname.startsWith('/rpc/')) {
      const response = await rpcHandler.handle(req, {
        context: {
          request: req,
          nest,
        },
        prefix: '/rpc',
      });

      if (!response.matched) {
        return new Response('Not found', { status: 404 });
      }

      return response.response;
    }

    return new Response('Not found', { status: 404 });
  },
});

console.log(`Server is running on port ${config.server.port}`);
