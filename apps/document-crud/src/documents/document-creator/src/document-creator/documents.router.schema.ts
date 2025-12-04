import { z } from 'zod/v4';
import { CreateDocumentDataSchema } from '../../../../../../../packages/types/src/document.types';
import { TemplatePlaceholderSchema } from '../../../../../../../packages/types/src/template.types';

export const CreateDocumentsInputSchema = z.object({
  templateFile: z.file(),
  data: z.array(CreateDocumentDataSchema),
  placeholders: z.array(TemplatePlaceholderSchema),
});

export const CreateDocumentsOutputSchema = z.file().refine(file => file.type === 'application/zip', {
  message: 'File must be a zip file',
});

export type CreateDocumentsInput = z.infer<typeof CreateDocumentsInputSchema>;
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;
