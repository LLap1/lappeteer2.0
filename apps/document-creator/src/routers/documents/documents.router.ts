import { CreateDocumentInputSchema, CreateDocumentOutputSchema } from 'src/routers/documents/documents.router.schema';
import { nest } from 'src/main';
import { os } from '@orpc/server';
import { DocumentCreatorService } from 'src/logic/document-creator/document-creator.model';
const base = os;

const create = base
  .route({
    method: 'POST',
    path: '/documents/create',
    summary: 'Create a document',
    tags: ['Documents'],
  })
  .input(CreateDocumentInputSchema)
  .output(CreateDocumentOutputSchema)
  .handler(async ({ input }) => {
    console.log(nest.get(DocumentCreatorService));
    return nest.get(DocumentCreatorService).createDocument(input);
  });

const router = {
  create,
};

export default router;
