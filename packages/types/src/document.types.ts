import { z } from 'zod/v4';

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

export const PlaceholderTypeSchema: z.ZodType<PlaceholderType> = z.literal(['map', 'text', 'image']);
