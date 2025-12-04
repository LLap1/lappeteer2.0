import { CreateDocumentsInputSchema, CreateDocumentsOutputSchema } from './documents.router.schema';
import { oc } from '@orpc/contract';
import { createDocumentInputExample } from '../docs/examples/create-document-input.example';

const create = oc
  .route({
    method: 'POST',
    path: '/documents/create',
    summary: 'Create documents',
    tags: ['Documents'],
    description: 'Create documents from a template with provided data',
  })
  .input(
    CreateDocumentsInputSchema.meta({
      examples: [createDocumentInputExample],
    }),
  )
  .output(CreateDocumentsOutputSchema);

const router = oc.router({
  create,
});

export default router;
