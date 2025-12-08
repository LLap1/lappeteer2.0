import { z } from 'zod/v4';
import { Base64DataURLSchema } from '@auto-document/types/file';

export const CreateMapsInputSchema = z.array(
  z.object({
    id: z.string(),
    width: z.number(),
    height: z.number(),
    center: z.tuple([z.number(), z.number()]),
    zoom: z.number(),
    geojson: z.array(z.any()),
  }),
);

export const CreateMapsOutputSchema = z.array(
  z.object({
    id: z.string(),
    layerDataUrls: z.array(Base64DataURLSchema),
  }),
);

export type CreateMapsInput = z.infer<typeof CreateMapsInputSchema>;
export type CreateMapsOutput = z.infer<typeof CreateMapsOutputSchema>;
