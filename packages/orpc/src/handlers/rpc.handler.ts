import { getFilenameFromContentDisposition } from '@orpc/standard-server';
import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { type Router } from '@orpc/server';
import { trace } from '@opentelemetry/api';

export default function createRpcHandler(root: Router<any, any>) {
  return new RPCHandler(root, {
    interceptors: [
      onError(error => {
        console.error(error);
      }),

      ({ request, next }) => {
        const span = trace.getActiveSpan();

        request.signal?.addEventListener('abort', () => {
          span?.addEvent('aborted', { reason: String(request.signal?.reason) });
        });

        return next();
      },
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
}
