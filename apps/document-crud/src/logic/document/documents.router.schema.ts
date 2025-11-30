import { z } from 'zod/v4';
import { CreateDocumentDataSchema } from '@auto-document/types/document';
import { oz } from '@orpc/zod';
import type {
  CreateDocumentPlaceholderData,
  CreateDocumentData,
  CreateDocumentMapInput,
  CreateDocumentStringInput,
  CreateDocumentDataTypes,
} from '@auto-document/types/document';

export const CreateDocumentsInputSchema = z.object({
  templateId: z.string(),
  data: z.array(CreateDocumentDataSchema),
});

export const CreateDocumentsOutputSchema = z.file().refine(file => file.type === 'application/zip', {
  message: 'File must be a zip file',
});

export type CreateDocumentsInput = z.infer<typeof CreateDocumentsInputSchema>;
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;

export type {
  CreateDocumentPlaceholderData,
  CreateDocumentData,
  CreateDocumentMapInput,
  CreateDocumentStringInput,
  CreateDocumentDataTypes,
};
