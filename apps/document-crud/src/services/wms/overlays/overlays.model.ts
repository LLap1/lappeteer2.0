import { Geometry } from 'geojson';

export type Overlay = {
  id: string;
  streamingUrl: string;
  gridUrl: string;
};

export type GetOverlayByIdInput = {
  id: string;
};

export type GetOverlayByIdOutput = Overlay;

export type GetOverlaysOutput = Overlay;

export type GroundToImageInput = {
  overlayId: string;
  geometry: Geometry;
  cropBbox: number[];
  cropWidth: number;
  cropHeight: number;
};

export type GroundToImageOutput = Geometry;
