import {
  CreateTemplateInputSchema,
  CreateTemplateOutputSchema,
  GetTemplateInputSchema,
  GetTemplateOutputSchema,
  ListTemplatesOutputSchema,
  DeleteTemplateInputSchema,
  DownloadTemplateOutputSchema,
  DownloadTemplateInputSchema,
  ListTemplatesInputSchema,
} from './templates.router.schema';
import { oc } from '@orpc/contract';

const create = oc
  .route({
    method: 'POST',
    path: '/templates',
    spec: {
      summary: 'Create a new template',
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
  .input(CreateTemplateInputSchema)
  .output(CreateTemplateOutputSchema);

const get = oc
  .route({
    method: 'GET',
    path: '/templates/:id',
    summary: 'Get template metadata',
    tags: ['Templates'],
    description: 'Get metadata for a template by ID',
  })
  .input(GetTemplateInputSchema)
  .output(GetTemplateOutputSchema);

const list = oc
  .route({
    method: 'GET',
    path: '/templates',
    summary: 'List all templates',
    tags: ['Templates'],
    description: 'Get a list of all template metadata',
  })
  .input(ListTemplatesInputSchema)
  .output(ListTemplatesOutputSchema);

const deleteTemplate = oc
  .route({
    method: 'DELETE',
    path: '/templates/:id',
    summary: 'Delete a template',
    tags: ['Templates'],
    description: 'Delete a template file and its metadata',
  })
  .input(DeleteTemplateInputSchema);

const download = oc
  .route({
    method: 'GET',
    path: '/templates/:id/download',
    summary: 'Download a template file',
    tags: ['Templates'],
    description: 'Download the PowerPoint template file by ID',
  })
  .input(DownloadTemplateInputSchema)
  .output(DownloadTemplateOutputSchema);

export const templates = oc.router({
  create,
  get,
  list,
  download,
  delete: deleteTemplate,
});
