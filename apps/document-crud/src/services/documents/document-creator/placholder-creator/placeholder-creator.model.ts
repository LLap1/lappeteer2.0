import type { PlaceholderMetadata } from '@auto-document/types/document';
import type { Feature, Geometry } from 'geojson';
import type { PlaceholderType } from '@auto-document/types/document';

export type GeoJsonStyleOptions = {
  color?: string;
  fillColor?: string;
  weight?: number;
  opacity?: number;
  fillOpacity?: number;
};

export type PlaceholderParams<T extends PlaceholderType = PlaceholderType> = PlaceholderMetadata<T> & {
  id: string;
  params: T extends 'map' ? MapPlaceholderParams : T extends 'text' ? TextPlaceholderParams : ImagePlaceholderParams;
};

export type MapPlaceholderParams = {
  center: [number, number];
  zoom: number;
  geojson: Feature<Geometry | null, { style?: GeoJsonStyleOptions } | null>[];
};

export type TextPlaceholderParams = string;
export type ImagePlaceholderParams = string;
