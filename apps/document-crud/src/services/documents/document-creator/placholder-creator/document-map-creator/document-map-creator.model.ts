import type { Feature, Geometry } from 'geojson';
import type { GeoJsonStyleOptions } from '@auto-document/domain/document-crud.schema';

export type CreateMapsInput = {
  id: string;
  width: number;
  height: number;
  geojson: Feature<Geometry, { style?: GeoJsonStyleOptions; text?: string } | null>[];
  overlayId: string;
}[];

export type ImageLayer = {
  path: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type CreateMapsOutput = {
  id: string;
  layers: ImageLayer[];
}[];
