import { CreateDocumentMapInput, CreateDocumentDataTypes, CreateDocumentStringInput } from '../documents.router.schema';

export type CreateDocumentDataParam<T extends CreateDocumentDataTypes> = T extends 'map'
  ? CreateDocumentMapInput
  : T extends 'text'
  ? CreateDocumentStringInput
  : never;
