import {
  CreateDocumentsInputSchema,
  CreateDocumentsOutputSchema,
  DeleteDocumentByIdInputSchema,
  DeleteDocumentByIdOutputSchema,
  ListDocumentsAllOutputSchema,
  GetDocumentByIdInputSchema,
  GetDocumentByIdOutputSchema,
} from './documents.router.schema';
import { oc } from '@orpc/contract';
import { createDocumentInputWithNoMapsExample } from 'src/docs/examples/create-document-input-no-maps';
import generalErrors from 'src/app.router.errors';
import documentErrors from './document.router.errors';
import templateErrors from '../templates/templates.router.errors';
const root = oc.errors(generalErrors);

const create = root
  .route({
    method: 'POST',
    path: '/documents',
    summary: 'Create documents',
    tags: ['Documents'],
    description: 'Create documents from a template with provided data',
  })
  .errors({
    DOCUMENT_CREATION_FAILED: documentErrors.DOCUMENT_CREATION_FAILED,
    TEMPLATE_NOT_FOUND: templateErrors.TEMPLATE_NOT_FOUND,
  })
  .input(
    CreateDocumentsInputSchema.meta({
      examples: [createDocumentInputWithNoMapsExample],
    }),
  )
  .output(CreateDocumentsOutputSchema);

const getById = root
  .route({
    method: 'GET',
    path: '/documents/{id}',
    summary: 'Get Document by ID',
    tags: ['Documents'],
    description: 'Get a document by ID',
  })
  .errors({ DOCUMENT_NOT_FOUND: documentErrors.DOCUMENT_NOT_FOUND })
  .input(GetDocumentByIdInputSchema)
  .output(GetDocumentByIdOutputSchema);

const list = root
  .route({
    method: 'GET',
    path: '/documents',
    summary: 'List All Documents',
    tags: ['Documents'],
    description: 'List all documents that were created.',
  })
  .errors({ DOCUMENT_LIST_ALL_FAILED: documentErrors.DOCUMENT_LIST_ALL_FAILED })
  .output(ListDocumentsAllOutputSchema);

const deleteById = root
  .route({
    method: 'DELETE',
    path: '/documents/{id}',
    summary: 'Delete Document by ID',
    tags: ['Documents'],
    description: 'Deletes a document that was created.',
  })
  .errors({
    DOCUMENT_NOT_FOUND: documentErrors.DOCUMENT_NOT_FOUND,
    DOCUMENT_DELETION_BY_ID_FAILED: documentErrors.DOCUMENT_DELETION_BY_ID_FAILED,
  })
  .input(DeleteDocumentByIdInputSchema)
  .output(DeleteDocumentByIdOutputSchema);

export const documents = oc.router({
  create,
  getById,
  list,
  deleteById,
});
