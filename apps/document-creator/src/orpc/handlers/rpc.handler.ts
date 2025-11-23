import { getFilenameFromContentDisposition } from '@orpc/standard-server';
import { RPCHandler } from '@orpc/server/fetch';
import root from 'src/orpc/routers/root.router';
import { onError } from '@orpc/client';

const rpcHandler = new RPCHandler(root, {
  interceptors: [
    onError(error => {
      console.error(error);
    }),
  ],
  rootInterceptors: [
    options => {
      const request = options.context.request as Request;

      return options.next({
        ...options,
        request: {
          ...options.request,
          async body() {
            const contentDisposition = request.headers.get('content-disposition');
            const contentType = request.headers.get('content-type');

            if (contentDisposition === null && contentType?.startsWith('multipart/form-data')) {
              return request.formData();
            }

            if (
              contentDisposition !== null ||
              (!contentType?.startsWith('application/json') &&
                !contentType?.startsWith('application/x-www-form-urlencoded'))
            ) {
              const fileName = getFilenameFromContentDisposition(contentDisposition ?? '') ?? 'blob';
              const blob = await request.blob();
              return new File([blob], fileName, {
                type: blob.type,
              });
            }

            return options.request.body();
          },
        },
      });
    },
  ],
});

export default rpcHandler;
