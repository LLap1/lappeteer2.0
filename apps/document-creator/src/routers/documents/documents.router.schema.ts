import { z } from 'zod';

export const CreateDocumentInputSchema = z.array(
  z.object({
    filename: z.string(),
  }),
);
export const CreateDocumentOutputSchema = z
  .instanceof(File)
  .refine(file => file.type === 'application/zip', {
    message: 'File must be a zip file',
  })
  .refine(file => file.name.endsWith('.zip'), {
    message: 'File name must end with .zip',
  });

export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
export type CreateDocumentOutput = z.infer<typeof CreateDocumentOutputSchema>;
