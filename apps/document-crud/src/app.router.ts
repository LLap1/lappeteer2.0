import { documents } from './documents/documents.router';
import { templates } from './templates/templates.router';
import { oc } from '@orpc/contract';
import { z } from 'zod';

export const errors = {
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'Internal Server Error',
    data: undefined,
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
    data: undefined,
  },
  DOCUMENT_CREATION_FAILED: {
    status: 400,
    message: 'Document creation failed',
    data: undefined,
  },
};

export const appRouter = oc.errors(errors).router({
  documents,
  templates,
});
