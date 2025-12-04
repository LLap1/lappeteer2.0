import { z } from 'zod/v4';
import { Base64DataURLSchema } from '@auto-document/types/file';

export const CreateMapsInputSchema = z.array(
  z.object({
    id: z.string(),
    center: z.tuple([z.number(), z.number()]),
    zoom: z.number(),
    width: z.number(),
    height: z.number(),
    geojson: z.array(z.any()),
  }),
);

export const CreateMapsOutputSchema = z.array(
  z.object({
    id: z.string(),
    dataUrl: Base64DataURLSchema,
  }),
);

export type CreateMapsInput = z.infer<typeof CreateMapsInputSchema>;
export type CreateMapsOutput = z.infer<typeof CreateMapsOutputSchema>;
