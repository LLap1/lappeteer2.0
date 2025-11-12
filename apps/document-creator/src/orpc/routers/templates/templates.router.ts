import { DownloadTemplateInputSchema, DownloadTemplateOutputSchema } from './templates.router.schema';
import { os } from '@orpc/server';
import { DocumentTemplateStorageService } from 'src/logic/document-template-storage/document-template-storage.service';
import type { FastifyReply } from 'fastify';
import { INestApplication } from '@nestjs/common';

const base = os.$context<{ reply: FastifyReply; nest: INestApplication }>();

const download = base
  .route({
    method: 'GET',
    path: '/templates/download/:filename',
    summary: 'Download a PowerPoint template',
    tags: ['Templates'],
    description: 'Download a previously uploaded PowerPoint template by filename',
  })
  .input(DownloadTemplateInputSchema)
  .output(DownloadTemplateOutputSchema)
  .handler(async ({ input, context }) => {
    const file = await context.nest.get(DocumentTemplateStorageService).download(input.filename);
    return file;
  });

const router = base.router({
  download,
});

export default router;
