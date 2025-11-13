import { z } from 'zod';
import { type Geometry } from 'geojson';
import { type PathOptions } from 'leaflet';

export const CreateDocumentsDataInputSchema = z.array(
  z.object({
    type: z.literal('map'),
    key: z.string(),
    creationData: z.object({
      center: z.tuple([z.number(), z.number()]),
      zoom: z.number().min(1).max(20).optional(),
      width: z.number(),
      height: z.number(),
      geojson: z.array(
        z.object({
          type: z.literal('Feature'),
          geometry: z.custom<Geometry>(),
          properties: z
            .object({
              style: z.custom<PathOptions>().optional(),
            })
            .optional(),
        }),
      ),
    }),
  }),
);

export type CreateDocumentMapsInput = z.infer<typeof CreateDocumentsDataInputSchema>;

export type CreateDocumentsDataOutput = {
  type: 'map';
  key: string;
  value: string;
}[];
