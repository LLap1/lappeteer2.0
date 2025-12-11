import {
  CreateDocumentsInputSchema,
  CreateDocumentsOutputSchema,
  DownloadDocumentInputSchema,
  DownloadDocumentOutputSchema,
} from './documents.router.schema';
import { oc } from '@orpc/contract';
import { createDocumentInputExample } from '../docs/examples/create-document-input.example';
import { createDocumentInputWithNoMapsExample } from 'src/docs/examples/create-document-input-no-maps';

const create = oc
  .route({
    method: 'POST',
    path: '/documents',
    summary: 'Create documents',
    tags: ['Documents'],
    description: 'Create documents from a template with provided data',
  })
  .input(
    CreateDocumentsInputSchema.meta({
      examples: [createDocumentInputWithNoMapsExample],
    }),
  )
  .output(CreateDocumentsOutputSchema);

const download = oc
  .route({
    method: 'GET',
    path: '/documents',
    summary: 'Download document',
    tags: ['Documents'],
    description: 'Download a document file from storage',
  })
  .input(DownloadDocumentInputSchema)
  .output(DownloadDocumentOutputSchema);

const router = oc.router({
  create,
  download,
});

export default router;
