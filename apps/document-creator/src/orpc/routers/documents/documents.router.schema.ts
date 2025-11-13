import { z } from 'zod/v4';
import type { Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import { ZipFileSchema } from 'src/models/file.model';
import { eventIteratorToStream } from '@orpc/client';

export const CreateDocumentsInputSchema = z.object({
  templateFileName: z.string(),
  data: z.array(
    z.object({
      filename: z.string(),
      map: z.array(
        z.object({
          type: z.literal('map'),
          key: z.string(),
          creationData: z.object({
            center: z.tuple([z.number(), z.number()]),
            zoom: z.number().min(1).max(20).optional(),
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
      ),
      strings: z.array(
        z.object({
          type: z.literal('string'),
          key: z.string(),
          value: z.string(),
        }),
      ),
    }),
  ),
});
export const CreateDocumentsOutputSchema = ZipFileSchema;

export type CreateDocumentsInput = z.infer<typeof CreateDocumentsInputSchema>;
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;
