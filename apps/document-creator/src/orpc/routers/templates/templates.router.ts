import {
  DownloadTemplateInputSchema,
  DownloadTemplateOutputSchema,
  UploadTemplateInputSchema,
  UploadTemplateOutputSchema,
} from './templates.router.schema';
import { os } from '@orpc/server';
import { TemplateFileService } from 'src/logic/template/template-file/template-file.service';
import { INestApplication } from '@nestjs/common';
import { TemplateParserService } from 'src/logic/template/template-parser/template-parser.service';
import { TemplateService } from 'src/logic/template/template.service';

const base = os.$context<{ nest: INestApplication; request: Request }>();

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
    const file = await context.nest.get(TemplateFileService).get(input.filename);
    console.log(file);
    return file;
  });

const upload = base
  .route({
    method: 'POST',
    path: '/templates/upload',
    summary: 'Upload a PowerPoint template',
    tags: ['Templates'],
    description: 'Upload a PowerPoint template file via multipart form data',
  })
  .input(UploadTemplateInputSchema)
  .output(UploadTemplateOutputSchema)
  .handler(async ({ input, context }) => {
    const metadata = await context.nest.get(TemplateService).upload(input.file);
    return metadata;
  });

const router = base.router({
  download,
  upload,
});

export default router;
