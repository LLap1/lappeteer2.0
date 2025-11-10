import { getFilenameFromContentDisposition } from '@orpc/standard-server';
import { RPCHandler } from '@orpc/server/fastify';
import root from 'src/orpc/routers/root.router';

const OVERRIDE_BODY_CONTEXT = Symbol('OVERRIDE_BODY_CONTEXT');

const rpcHandler = new RPCHandler(root, {
  adapterInterceptors: [
    options => {
      return options.next({
        ...options,
        context: {
          ...options.context,
          [OVERRIDE_BODY_CONTEXT as any]: {
            fetchRequest: options.request,
          },
        },
      });
    },
  ],
  rootInterceptors: [
    options => {
      const { fetchRequest } = (options.context as any)[OVERRIDE_BODY_CONTEXT];

      return options.next({
        ...options,
        request: {
          ...options.request,
          async body() {
            const contentDisposition = fetchRequest.headers.get('content-disposition');
            const contentType = fetchRequest.headers.get('content-type');

            if (contentDisposition === null && contentType?.startsWith('multipart/form-data')) {
              // Custom handling for multipart/form-data
              // Example: use @mjackson/form-data-parser for streaming parsing
              return fetchRequest.formData();
            }

            // if has content-disposition always treat as file upload
            if (
              contentDisposition !== null ||
              (!contentType?.startsWith('application/json') &&
                !contentType?.startsWith('application/x-www-form-urlencoded'))
            ) {
              // Custom handling for file uploads
              // Example: streaming file into disk to reduce memory usage
              const fileName = getFilenameFromContentDisposition(contentDisposition ?? '') ?? 'blob';
              const blob = await fetchRequest.blob();
              return new File([blob], fileName, {
                type: blob.type,
              });
            }

            // fallback to default body parser
            return options.request.body();
          },
        },
      });
    },
  ],
});

export default rpcHandler;
