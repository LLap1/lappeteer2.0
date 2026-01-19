import { z } from 'zod';

export default {
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'Internal Server Error',
    data: z.object({
      error: z.any(),
    }),
  },
  TEMPLATE_NOT_FOUND: {
    status: 404,
    message: 'Template not found',
    data: z.object({
      templateId: z.string(),
    }),
  },
  TEMPLATE_UPLOAD_FAILED: {
    status: 500,
    message: 'Template upload failed',
    data: z.object({
      error: z.any(),
    }),
  },
  TEMPLATE_LIST_DOCUMENTS_FAILED: {
    status: 500,
    message: 'Template list documents failed',
    data: z.object({
      error: z.any(),
      templateId: z.string(),
    }),
  },
};
