import { CreateDocumentInputSchema, CreateDocumentOutputSchema } from 'src/routers/documents/documents.router.schema';
import { nest } from 'src/main';
import { os } from '@orpc/server';
import { DocumentCreatorService } from 'src/logic/document-creator/document-creator.model';
import type { FastifyReply } from 'fastify';

const base = os.$context<{ reply: FastifyReply }>();

const create = base
  .route({
    method: 'POST',
    path: '/documents/create',
    summary: 'Create a document',
    tags: ['Documents'],
  })
  .input(CreateDocumentInputSchema)
  .output(CreateDocumentOutputSchema)
  .handler(async ({ input, context }) => {
    const document = await nest.get(DocumentCreatorService).createDocument(input);
    return document;
  });

const router = {
  create,
};

export default router;
