import type { Feature, Geometry } from 'geojson';
import type { GeoJsonStyleOptions } from '@auto-document/domain/document-crud.schema';

export type CreateMapsInput = {
  id: string;
  width: number;
  height: number;
  geojson: Feature<Geometry, { style?: GeoJsonStyleOptions } | null>[];
  overlayId: string;
}[];

export type CreateMapsOutput = {
  id: string;
  imagePaths: string[];
}[];
