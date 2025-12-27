import {
  CreateTemplateInputSchema,
  CreateTemplateOutputSchema,
  GetTemplateInputSchema,
  GetTemplateOutputSchema,
  ListTemplatesOutputSchema,
  DeleteTemplateInputSchema,
  ListTemplatesInputSchema,
} from './templates.router.schema';
import { oc } from '@orpc/contract';
import generalErrors from 'src/app.router.errors';
import templateErrors from './templates.router.errors';

const root = oc.errors(generalErrors);

const create = root
  .route({
    method: 'POST',
    path: '/templates',
    spec: {
      summary: 'Create Template',
      tags: ['Templates'],
      description: 'Upload a PowerPoint template file and create metadata',
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
        },
      },
    },
  })
  .errors({ TEMPLATE_UPLOAD_FAILED: templateErrors.TEMPLATE_UPLOAD_FAILED })
  .input(CreateTemplateInputSchema)
  .output(CreateTemplateOutputSchema);

const get = root
  .route({
    method: 'GET',
    path: '/templates/{id}',
    summary: 'Get Template by ID',
    tags: ['Templates'],
    description: 'Get metadata for a template by ID',
  })
  .errors({ TEMPLATE_NOT_FOUND: templateErrors.TEMPLATE_NOT_FOUND })
  .input(GetTemplateInputSchema)
  .output(GetTemplateOutputSchema);

const list = root
  .route({
    method: 'GET',
    path: '/templates',
    summary: 'List All Templates',
    tags: ['Templates'],
    description: 'Get a list of all template metadata',
  })
  .input(ListTemplatesInputSchema)
  .output(ListTemplatesOutputSchema);

const deleteTemplate = root
  .route({
    method: 'DELETE',
    path: '/templates/{id}',
    summary: 'Delete Template by ID',
    tags: ['Templates'],
    description: 'Delete a template file and its metadata',
  })
  .errors({ TEMPLATE_NOT_FOUND: templateErrors.TEMPLATE_NOT_FOUND })
  .input(DeleteTemplateInputSchema);

export const templates = root.router({
  create,
  get,
  list,
  delete: deleteTemplate,
});
