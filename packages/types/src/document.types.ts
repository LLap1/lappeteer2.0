import { z } from 'zod/v4';
import type { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';

export const CreateDocumentDataTypesSchema = z.enum(['map', 'text', 'image']);

export const CreateDocumentMapInputSchema = z.object({
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().min(1).max(20),
  geojson: z.array(z.custom<Feature<Geometry, { style: PathOptions }>>()),
});

export const CreateDocumentStringInputSchema = z.string();
export const CreateDocumentImageInputSchema = z.url();

export const CreateDocumentPlaceholderDataSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('map'),
    key: z.string(),
    id: z.string().or(z.null()).default(null),
    width: z.number().or(z.null()).default(null),
    height: z.number().or(z.null()).default(null),
    value: CreateDocumentMapInputSchema,
  }),
  z.object({
    type: z.literal('text'),
    key: z.string(),
    id: z.string().or(z.null()).default(null),
    width: z.number().or(z.null()).default(null),
    height: z.number().or(z.null()).default(null),
    value: CreateDocumentStringInputSchema,
  }),
  z.object({
    type: z.literal('image'),
    key: z.string(),
    id: z.string().or(z.null()).default(null),
    width: z.number().or(z.null()).default(null),
    height: z.number().or(z.null()).default(null),
    value: CreateDocumentImageInputSchema,
  }),
]);

export const CreateDocumentDataSchema = z.object({
  placeholderData: z.array(CreateDocumentPlaceholderDataSchema),
  filename: z.string(),
});

export type CreateDocumentPlaceholderData = z.infer<typeof CreateDocumentPlaceholderDataSchema>;
export type CreateDocumentData = z.infer<typeof CreateDocumentDataSchema>;
export type CreateDocumentMapInput = z.infer<typeof CreateDocumentMapInputSchema>;
export type CreateDocumentStringInput = z.infer<typeof CreateDocumentStringInputSchema>;
export type CreateDocumentImageInput = z.infer<typeof CreateDocumentImageInputSchema>;
export type CreateDocumentDataTypes = z.infer<typeof CreateDocumentDataTypesSchema>;
