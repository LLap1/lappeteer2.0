import { z } from 'zod/v4';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import { ZipFileSchema } from 'src/models/file.model';

export const CreateDocumentDataTypesSchema = z.enum(['map', 'string']);
export const CreateDocumentMapInputSchema = z.object({
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().min(1).max(20),
  width: z.number().or(z.null()).default(null),
  height: z.number().or(z.null()).default(null),
  geojson: z.array(z.custom<FeatureCollection<Geometry, { style: PathOptions }>>()),
});

export const CreateDocumentDataSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('map'),
    key: z.string(),
    value: CreateDocumentMapInputSchema,
  }),
  z.object({
    type: z.literal('string'),
    key: z.string(),
    value: z.string(),
  }),
]);
export const CreateDocumentInputSchema = z.object({
  templateFileName: z.string(),
  filename: z.string(),
  data: z.array(CreateDocumentDataSchema),
});

export const CreateDocumentStringInputSchema = z.string();

export type CreateDocumentData = z.infer<typeof CreateDocumentDataSchema>;
export type CreateDocumentMapInput = z.infer<typeof CreateDocumentMapInputSchema>;
export type CreateDocumentStringInput = z.infer<typeof CreateDocumentStringInputSchema>;
export type CreateDocumentDataTypes = z.infer<typeof CreateDocumentDataTypesSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
