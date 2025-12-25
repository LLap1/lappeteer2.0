import {
  CreateDocumentsInputSchema,
  CreateDocumentsOutputSchema,
  DeleteAllDocumentsInputSchema,
  DeleteAllDocumentsOutputSchema,
  DeleteDocumentByIdInputSchema,
  DeleteDocumentByIdOutputSchema,
  DownloadDocumentInputSchema,
  DownloadDocumentOutputSchema,
  ListDocumentsAllInputSchema,
  ListDocumentsAllOutputSchema,
  ListDocumentsByTemplateIdInputSchema,
  ListDocumentsByTemplateIdOutputSchema,
} from './documents.router.schema';
import { oc } from '@orpc/contract';
import { createDocumentInputWithNoMapsExample } from 'src/docs/examples/create-document-input-no-maps';

const root = oc;

const create = root
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

const download = root
  .route({
    method: 'GET',
    path: '/documents',
    summary: 'Download document',
    tags: ['Documents'],
    description: 'Download a document file from storage',
  })
  .input(DownloadDocumentInputSchema)
  .output(DownloadDocumentOutputSchema);

const listAll = root
  .route({
    method: 'GET',
    path: '/documents/list',
    summary: 'List Documents',
    tags: ['Documents'],
    description: 'List all documents that were created.',
  })
  .input(ListDocumentsAllInputSchema)
  .output(ListDocumentsAllOutputSchema);

const deleteById = root
  .route({
    method: 'DELETE',
    path: '/documents/{id}',
    summary: 'Delete Document by ID',
    tags: ['Documents'],
    description: 'Deletes a document that was created.',
  })
  .input(DeleteDocumentByIdInputSchema)
  .output(DeleteDocumentByIdOutputSchema);

const deleteAll = root
  .route({
    method: 'DELETE',
    path: '/documents/delete-all',
    summary: 'Delete All Documents',
    tags: ['Documents'],
    description: 'Deletes all documents that were created.',
  })
  .input(DeleteAllDocumentsInputSchema)
  .output(DeleteAllDocumentsOutputSchema);
export const documents = oc.router({
  create,
  download,
  listAll,
  deleteById,
  deleteAll,
});
