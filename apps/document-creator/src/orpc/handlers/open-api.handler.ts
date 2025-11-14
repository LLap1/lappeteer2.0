import { OpenAPIHandler } from '@orpc/openapi/fastify';
import root from 'src/orpc/routers/root.router';
import { onError } from '@orpc/server';
import type { FastifyRequest } from 'fastify';

const openApiHandler = new OpenAPIHandler(root, {
  interceptors: [
    onError(error => {
      console.error(error);
    }),
    options => {
      const fastifyRequest = options.context.reply?.request as FastifyRequest | undefined;
      const contentType = fastifyRequest?.headers['content-type'] || '';

      if (contentType.includes('multipart/form-data') && fastifyRequest && fastifyRequest.isMultipart()) {
        return options.next({
          ...options,
          request: {
            ...options.request,
            async body() {
              const formData: Record<string, File> = {};
              const parts = fastifyRequest.parts();

              for await (const part of parts) {
                if (part.type === 'file') {
                  const buffers: Buffer[] = [];
                  for await (const chunk of part.file) {
                    buffers.push(chunk);
                  }
                  const buffer = Buffer.concat(buffers);
                  formData[part.fieldname] = new File([buffer], part.filename || 'file', {
                    type: part.mimetype || 'application/octet-stream',
                  });
                }
              }

              return formData;
            },
          },
        });
      }

      return options.next(options);
    },
  ],
});

export default openApiHandler;
