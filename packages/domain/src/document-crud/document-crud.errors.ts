import { z } from 'zod';

export default {
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'Internal Server Error',
    data: z.object({
      error: z.any(),
    }),
  },
};

export * from './documents/documents.errors';
export * from './templates/templates.errors';