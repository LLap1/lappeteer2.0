import {
  CreateDocumentMapInput,
  CreateDocumentDataTypes,
  CreateDocumentStringInput,
} from '../document-creator/documents.router.schema';

export type CreateDocumentDataParam<T extends CreateDocumentDataTypes> = T extends 'map'
  ? CreateDocumentMapInput
  : T extends 'text'
  ? CreateDocumentStringInput
  : never;
