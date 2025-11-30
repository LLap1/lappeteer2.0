import { CreateDocumentsInputSchema, CreateDocumentsOutputSchema } from './documents.router.schema';
import { oc } from '@orpc/contract';

const create = oc
  .route({
    method: 'POST',
    path: '/documents/create',
    summary: 'Create documents',
    tags: ['Documents'],
    description: 'Create documents from a template with provided data',
  })
  .input(CreateDocumentsInputSchema)
  .output(CreateDocumentsOutputSchema);

const router = {
  create,
};

export default router;
