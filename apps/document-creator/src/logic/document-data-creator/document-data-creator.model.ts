import { z } from 'zod';

export const CreateDocumentsDataOutputSchema = z.array(
  z.object({
    filename: z.string(),
    map: z.array(
      z.object({
        type: z.literal('map'),
        key: z.string(),
        value: z.base64(),
      }),
    ),
    strings: z.array(
      z.object({
        type: z.literal('string'),
        value: z.string(),
        key: z.string(),
      }),
    ),
  }),
);

export type CreateDocumentsDataOutput = z.infer<typeof CreateDocumentsDataOutputSchema>;
