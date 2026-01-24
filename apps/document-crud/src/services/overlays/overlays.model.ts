import { Geometry } from 'geojson';

export type Overlay = {
  id: string;
  pixelTileUrl: string;
  gridUrl: string;
};

export type GetOverlayByIdInput = {
  id: string;
};

export type GroundToImageInput = {
  overlayId: string;
  geometry: Geometry;
  gridUrl?: string;
};

export type GroundToImageOutput = Geometry;
