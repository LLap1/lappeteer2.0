import { documents } from './services/documents/documents.router';
import { templates } from './services/templates/templates.router';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ErrorMap } from '@orpc/contract';

export const errors = {
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
  DOCUMENT_NOT_FOUND: {
    status: 404,
    message: 'Document not found',
    data: z.object({
      error: z.any(),
      filePath: z.string(),
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
  DOCUMENT_DELETION_FAILED: {
    status: 500,
    message: 'Document deletion failed',
    data: z.object({
      error: z.any(),
      documentId: z.string(),
    }),
  },
  TEMPLATE_UPLOAD_FAILED: {
    status: 500,
    message: 'Template upload failed',
    data: z.object({
      error: z.any(),
      templateId: z.string(),
    }),
  },
};

export const appRouter = oc.errors(errors).router({
  documents,
  templates,
});
