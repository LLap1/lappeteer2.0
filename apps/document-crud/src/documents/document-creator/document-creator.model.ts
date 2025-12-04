import {
  CreateDocumentMapInput,
  CreateDocumentStringInput,
  CreateDocumentImageInput,
  CreateDocumentDataTypes,
} from '../documents.router.schema';

export type MergedParams<T extends CreateDocumentDataTypes = CreateDocumentDataTypes> = {
  id: string;
  key: string;
  type: T;
  value: string;
  width: number;
  height: number;
};
