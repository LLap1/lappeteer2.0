import { z } from 'zod';

export default {
  DOCUMENT_NOT_FOUND: {
    status: 404,
    message: 'Document not found',
    data: z.object({
      documentId: z.string(),
    }),
  },
  DOCUMENT_CREATION_FAILED: {
    status: 400,
    message: 'Document creation failed',
    data: z.object({
      error: z.any(),
      templateId: z.string(),
    }),
  },
  DOCUMENT_LIST_BY_TEMPLATE_ID_FAILED: {
    status: 500,
    message: 'Document list by template id failed',
    data: z.object({
      error: z.any(),
      templateId: z.string(),
    }),
  },
  DOCUMENT_LIST_ALL_FAILED: {
    status: 500,
    message: 'Document list all failed',
    data: z.object({
      error: z.any(),
    }),
  },
  DOCUMENT_DELETION_BY_ID_FAILED: {
    status: 500,
    message: 'Document deletion failed',
    data: z.object({
      error: z.any(),
      documentId: z.string(),
    }),
  },
  DOCUMENT_DELETION_ALL_FAILED: {
    status: 500,
    message: 'Document deletion all failed',
    data: z.object({
      error: z.any(),
    }),
  },
};
