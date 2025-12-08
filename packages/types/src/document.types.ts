import { z } from 'zod/v4';
import { PptxFileSchema } from './file.types';

export type PlaceholderType = 'map' | 'text' | 'image';
export type PlaceholderMetadata<T extends PlaceholderType> = {
  type: T;
  width: number;
  height: number;
  key: string;
};

export type Placeholder<T extends PlaceholderType = PlaceholderType> = PlaceholderMetadata<T> & {
  id: string;
  value: PlaceholderData<T>;
};

export type PlaceholderData<T extends PlaceholderType> = T extends 'map'
  ? MapPlaceholderData
  : T extends 'text'
  ? TextPlaceholderData
  : T extends 'image'
  ? ImagePlaceholderData
  : never;

export type MapPlaceholderData = string[];
export type TextPlaceholderData = string;
export type ImagePlaceholderData = string;

export const MapPlaceholderDataSchema: z.ZodType<MapPlaceholderData> = z.array(z.string());
export const TextPlaceholderDataSchema: z.ZodType<TextPlaceholderData> = z.string();
export const ImagePlaceholderDataSchema: z.ZodType<ImagePlaceholderData> = z.string();

export const DocumentSchema = PptxFileSchema;
export const TemplateSchema = PptxFileSchema;

export const PlaceholderTypeSchema: z.ZodType<PlaceholderType> = z.literal(['map', 'text', 'image']);

export const PlaceholderSchema: z.ZodType<Placeholder<PlaceholderType>> = z
  .object({
    id: z.string(),
    key: z.string(),
    width: z.coerce.number(),
    height: z.coerce.number(),
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('map'),
        value: MapPlaceholderDataSchema,
      }),
      z.object({
        type: z.literal('text'),
        value: TextPlaceholderDataSchema,
      }),
      z.object({
        type: z.literal('image'),
        value: ImagePlaceholderDataSchema,
      }),
    ]),
  );

export const PlaceholderMetadataSchema: z.ZodType<PlaceholderMetadata<PlaceholderType>> = z.object({
  type: PlaceholderTypeSchema,
  key: z.string(),
  width: z.coerce.number(),
  height: z.coerce.number(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type Template = z.infer<typeof TemplateSchema>;
