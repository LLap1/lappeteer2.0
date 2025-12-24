import {
  CreateDocumentsInputSchema,
  CreateDocumentsOutputSchema,
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

const listByTemplateId = root
  .route({
    method: 'GET',
    path: '/documents/{templateId}/list',
    summary: 'List Documents by Template ID',
    tags: ['Documents'],
    description: 'List all documents that were created from a specific template.',
  })
  .input(
    ListDocumentsByTemplateIdInputSchema.meta({ examples: [{ templateId: 'b5a38848-6723-4cb6-a969-cf7170826280' }] }),
  )
  .output(ListDocumentsByTemplateIdOutputSchema);

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
    summary: 'Delete All Documents',
    tags: ['Documents'],
    description: 'Deletes all generated documents that were created.',
  })
  .input(DeleteDocumentByIdInputSchema)
  .output(DeleteDocumentByIdOutputSchema);

export const documents = oc.router({
  create,
  download,
  listByTemplateId,
  listAll,
  deleteById,
});
