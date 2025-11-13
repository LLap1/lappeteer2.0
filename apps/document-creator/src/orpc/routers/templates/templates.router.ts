import { DownloadTemplateInputSchema, DownloadTemplateOutputSchema } from './templates.router.schema';
import { os } from '@orpc/server';
import { TemplateFileService } from 'src/logic/template/template-file-storage/template-file-storage.service';
import type { FastifyReply } from 'fastify';
import { INestApplication } from '@nestjs/common';
import { TemplateParserService } from 'src/logic/template/template-parser/template-parser.service';
import { TemplateService } from 'src/logic/template/template.service';

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
    const file = await context.nest.get(TemplateFileService).download(input.filename);
    return file;
  });

const upload = base
  .route({
    method: 'POST',
    path: '/templates/upload',
    summary: 'Upload a PowerPoint template',
    tags: ['Templates'],
  })
  .handler(async ({ input, context }) => {
    const file = Object.values(input as any)[0] as File;
    const metadata = await context.nest.get(TemplateService).upload(file);
    return metadata;
  });

const router = base.router({
  download,
  upload,
});

export default router;
