import { z } from 'zod/v4';
import type { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';
import { ZipFileSchema } from '@auto-document/types/file';
import { GeoJsonFeatureSchema } from '@auto-document/types/geojson';

export const CreateDocumentDataTypesSchema = z.enum(['map', 'text', 'image']);

export const CreateDocumentMapInputSchema = z
  .object({
    center: z
      .tuple([z.coerce.number(), z.coerce.number()])
      .refine(([lat, lng]) => lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180, {
        message: 'Center coordinates must be valid latitude [-90, 90] and longitude [-180, 180]',
      }),
    zoom: z.coerce.number().int().min(1).max(20),
    geojson: z.array(GeoJsonFeatureSchema).min(0),
  })
  .strict();

export const CreateDocumentStringInputSchema = z.string().min(1);
export const CreateDocumentImageInputSchema = z.url();

export const CreateDocumentMapPlaceholderDataSchema = z
  .object({
    type: z.literal('map'),
    key: z.string().min(1),
    value: CreateDocumentMapInputSchema,
  })
  .strict();

export const CreateDocumentTextPlaceholderDataSchema = z
  .object({
    type: z.literal('text'),
    key: z.string().min(1),
    value: CreateDocumentStringInputSchema,
  })
  .strict();

export const CreateDocumentImagePlaceholderDataSchema = z
  .object({
    type: z.literal('image'),
    key: z.string().min(1),
    value: CreateDocumentImageInputSchema,
  })
  .strict();

const CreateDocumentPlaceholderDataUnionSchema = z.discriminatedUnion('type', [
  CreateDocumentMapPlaceholderDataSchema,
  CreateDocumentTextPlaceholderDataSchema,
  CreateDocumentImagePlaceholderDataSchema,
]);

export const CreateDocumentPlaceholderDataSchema = z.array(CreateDocumentPlaceholderDataUnionSchema).min(1);

export const CreateDocumentDataSchema = z
  .object({
    placeholderData: CreateDocumentPlaceholderDataSchema,
    filename: z
      .string()
      .min(1)
      .refine(
        filename => {
          const extension = filename.split('.').pop()?.toLowerCase();
          return extension === 'pptx' || extension === 'ppt';
        },
        {
          message: 'Filename must have .pptx or .ppt extension',
        },
      ),
  })
  .strict();

export const CreateDocumentsInputSchema = z
  .object({
    templateId: z.string().min(1),
    zipFileName: z
      .string()
      .min(1)
      .refine(
        filename => {
          const extension = filename.split('.').pop()?.toLowerCase();
          return extension === 'zip';
        },
        {
          message: 'Zip filename must have .zip extension',
        },
      ),
    data: z.array(CreateDocumentDataSchema).min(1),
  })
  .strict();

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
