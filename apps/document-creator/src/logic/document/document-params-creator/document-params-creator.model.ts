import {
  CreateDocumentMapInput,
  CreateDocumentDataTypes,
  CreateDocumentStringInput,
} from 'src/orpc/routers/documents/documents.router.schema';

export type CreateDocumentDataParam<T extends CreateDocumentDataTypes> = T extends 'map'
  ? CreateDocumentMapInput
  : T extends 'text'
  ? CreateDocumentStringInput
  : never;
