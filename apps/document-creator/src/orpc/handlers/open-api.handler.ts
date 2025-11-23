import { OpenAPIHandler } from '@orpc/openapi/fetch';
import root from 'src/orpc/routers/root.router';
import { onError } from '@orpc/server';

const openApiHandler = new OpenAPIHandler(root, {
  interceptors: [
    onError(error => {
      console.error(error);
    }),
    options => {
      const request = options.context.request as Request;
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        return options.next({
          ...options,
          request: {
            ...options.request,
            async body() {
              const formData = await request.formData();
              const formDataObj: Record<string, File> = {};

              for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                  formDataObj[key] = value;
                }
              }

              return formDataObj;
            },
          },
        });
      }

      return options.next(options);
    },
  ],
});

export default openApiHandler;
