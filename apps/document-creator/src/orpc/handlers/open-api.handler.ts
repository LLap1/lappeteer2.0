import { getFilenameFromContentDisposition } from '@orpc/standard-server';
import { OpenAPIHandler } from '@orpc/openapi/fastify';
import root from 'src/orpc/routers/root.router';
import { onError } from '@orpc/server';

const OVERRIDE_BODY_CONTEXT = Symbol('OVERRIDE_BODY_CONTEXT');

const openApiHandler = new OpenAPIHandler(root, {
  interceptors: [
    onError(error => {
      console.error(error);
    }),
  ],
});

export default openApiHandler;
