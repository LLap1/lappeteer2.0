import { z } from 'zod';

export const CreateDocumentInputSchema = z.object({
  url: z.url(),
});
export const CreateDocumentOutputSchema = z.instanceof(Uint8Array<ArrayBufferLike>);

export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
export type CreateDocumentOutput = z.infer<typeof CreateDocumentOutputSchema>;
