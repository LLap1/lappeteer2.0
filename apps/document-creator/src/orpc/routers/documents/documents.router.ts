import {
  CreateDocumentsInputSchema,
  CreateDocumentsOutputSchema,
} from 'src/orpc/routers/documents/documents.router.schema';
import { os } from '@orpc/server';
import { DocumentService } from 'src/logic/document/document.service';
import type { FastifyReply } from 'fastify';
import { INestApplication } from '@nestjs/common';

const base = os.$context<{ reply: FastifyReply; nest: INestApplication }>();

const create = base
  .route({
    method: 'POST',
    path: '/documents/create',
    summary: 'Create a document',
    tags: ['Documents'],
  })
  .input(CreateDocumentsInputSchema)
  .output(CreateDocumentsOutputSchema)
  .handler(async ({ input, context }): Promise<File> => {
    const document = await context.nest.get(DocumentService).create(input);
    return document as any;
  });

const router = base.router({
  create,
});

export default router;
