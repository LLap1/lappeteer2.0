import { CreateDocumentInput } from 'src/routers/documents/documents.router.schema';

export const createDocumentInputExample: CreateDocumentInput = [
  {
    filename: 'map-location-1.png',
  },
  {
    filename: 'map-location-2.png',
  },
  {
    filename: 'map-location-3.png',
  },
];

export const createDocumentInputMinimalExample: CreateDocumentInput = [
  {
    filename: 'map-document.png',
  },
];

export const createDocumentInputWithDefaultFilenamesExample: CreateDocumentInput = [
  {
    filename: 'document-1.png',
  },
  {
    filename: 'document-2.png',
  },
  {
    filename: 'document-3.png',
  },
];
