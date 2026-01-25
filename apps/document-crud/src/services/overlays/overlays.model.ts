import { Geometry } from 'geojson';

export type Overlay = {
  id: string;
  pixelWmsUrl: string;
  pixelTileUrl: string;
  gridUrl: string;
};

export type GetPixelWmsUrlInput = {
  overlayId: string;
  bbox: number[];
  width: number;
  height: number;
  layers: string[];
  format: string;
};

export type GetPixelWmsUrlOutput = string;

export type GetOverlayByIdInput = {
  id: string;
};

export type GroundToImageInput = {
  overlayId: string;
  geometry: Geometry;
  gridUrl?: string;
};

export type GroundToImageOutput = Geometry;
