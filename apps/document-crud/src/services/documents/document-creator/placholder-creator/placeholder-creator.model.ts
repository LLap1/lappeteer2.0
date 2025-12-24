import type { PlaceholderMetadata } from '@auto-document/types/document';
import { PathOptions } from 'leaflet';
import { Feature, Geometry } from 'geojson';
import type { PlaceholderType } from '@auto-document/types/document';

export type PlaceholderParams<T extends PlaceholderType = PlaceholderType> = PlaceholderMetadata<T> & {
  id: string;
  params: T extends 'map' ? MapPlaceholderParams : T extends 'text' ? TextPlaceholderParams : ImagePlaceholderParams;
};
export type MapPlaceholderParams = {
  center: [number, number];
  zoom: number;
  geojson: Feature<Geometry | null, { style?: PathOptions } | null>[];
};

export type TextPlaceholderParams = string;
export type ImagePlaceholderParams = string;
