import { z } from 'zod/v4';
import type { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import { ZipFileSchema } from '@auto-document/types/file';

export const CreateDocumentDataTypesSchema = z.enum(['map', 'text', 'image']);

export const CreateDocumentMapInputSchema = z.object({
  center: z.tuple([z.coerce.number(), z.coerce.number()]),
  zoom: z.coerce.number().min(1).max(20),
  geojson: z.array(z.custom<Feature<Geometry, { style: PathOptions }>>()),
});

export const CreateDocumentStringInputSchema = z.string();
export const CreateDocumentImageInputSchema = z.url();

export const CreateDocumentMapPlaceholderDataSchema = z.object({
  type: z.literal('map'),
  key: z.string(),
  value: CreateDocumentMapInputSchema,
});

export const CreateDocumentTextPlaceholderDataSchema = z.object({
  type: z.literal('text'),
  key: z.string(),
  value: CreateDocumentStringInputSchema,
});

export const CreateDocumentImagePlaceholderDataSchema = z.object({
  type: z.literal('image'),
  key: z.string(),
  value: CreateDocumentImageInputSchema,
});

export const CreateDocumentPlaceholderDataSchema = z.array(
  z.discriminatedUnion('type', [
    CreateDocumentMapPlaceholderDataSchema,
    CreateDocumentTextPlaceholderDataSchema,
    CreateDocumentImagePlaceholderDataSchema,
  ]),
);

export const CreateDocumentDataSchema = z.object({
  placeholderData: CreateDocumentPlaceholderDataSchema,
  filename: z.string(),
});

export const CreateDocumentsInputSchema = z.object({
  templateId: z.string(),
  zipFileName: z.string(),
  data: z.array(CreateDocumentDataSchema),
});

export const CreateDocumentsOutputSchema = ZipFileSchema;

export type CreateDocumentsInput = z.infer<typeof CreateDocumentsInputSchema>;
export type CreateDocumentsOutput = z.infer<typeof CreateDocumentsOutputSchema>;
export type CreateDocumentMapPlaceholderData = z.infer<typeof CreateDocumentMapPlaceholderDataSchema>;
export type CreateDocumentTextPlaceholderData = z.infer<typeof CreateDocumentTextPlaceholderDataSchema>;
export type CreateDocumentImagePlaceholderData = z.infer<typeof CreateDocumentImagePlaceholderDataSchema>;
export type CreateDocumentPlaceholderData = z.infer<typeof CreateDocumentPlaceholderDataSchema>;
export type CreateDocumentData = z.infer<typeof CreateDocumentDataSchema>;
export type CreateDocumentMapInput = z.infer<typeof CreateDocumentMapInputSchema>;
export type CreateDocumentStringInput = z.infer<typeof CreateDocumentStringInputSchema>;
export type CreateDocumentImageInput = z.infer<typeof CreateDocumentImageInputSchema>;
export type CreateDocumentDataTypes = z.infer<typeof CreateDocumentDataTypesSchema>;
