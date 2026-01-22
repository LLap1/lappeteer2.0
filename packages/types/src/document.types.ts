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

export type ImageLayer = {
  path: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type MapPlaceholderData = ImageLayer[];
export type TextPlaceholderData = string;
export type ImagePlaceholderData = {
  url: string;
  rotation?: number;
};

export const PlaceholderTypeSchema: z.ZodType<PlaceholderType> = z.literal(['map', 'text', 'image']);
