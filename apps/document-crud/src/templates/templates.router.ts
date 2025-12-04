import {
  CreateTemplateInputSchema,
  CreateTemplateOutputSchema,
  GetTemplateInputSchema,
  GetTemplateOutputSchema,
  ListTemplatesOutputSchema,
  UpdateTemplateInputSchema,
  UpdateTemplateOutputSchema,
  DeleteTemplateInputSchema,
  DownloadTemplateOutputSchema,
  DownloadTemplateInputSchema,
} from './templates.router.schema';
import { oc } from '@orpc/contract';

const create = oc
  .route({
    method: 'POST',
    path: '/templates',
    summary: 'Create a new template',
    tags: ['Templates'],
    description: 'Upload a PowerPoint template file and create metadata',
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
  .output(ListTemplatesOutputSchema);

const update = oc
  .route({
    method: 'PUT',
    path: '/templates/:id',
    summary: 'Update template metadata',
    tags: ['Templates'],
    description: 'Update placeholders for an existing template',
  })
  .input(UpdateTemplateInputSchema)
  .output(UpdateTemplateOutputSchema);

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

const router = oc.router({
  create,
  get,
  list,
  update,
  download,
  delete: deleteTemplate,
});

export default router;
