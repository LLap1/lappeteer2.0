import type { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';

export type CreateMapsInput = {
  id: string;
  width: number;
  height: number;
  geojson: Feature<Geometry, { style?: PathOptions; text?: string } | null>[];
  overlayId: string;
  rotation?: number;
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
