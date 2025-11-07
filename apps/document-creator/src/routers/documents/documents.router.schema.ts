import { z } from 'zod';

export const CreateDocumentInputSchema = z.object({});
export const CreateDocumentOutputSchema = z.instanceof(File);

export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
export type CreateDocumentOutput = z.infer<typeof CreateDocumentOutputSchema>;
 