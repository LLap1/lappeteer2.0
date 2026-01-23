import { Geometry } from "geojson";

export type Overlay = {
  id: string;
  streamingUrl: string;

};


export type GetOverlayByIdInput = {
  id: string;
};

export type GetOverlayByIdOutput = Overlay;

export type GetOverlaysOutput = Overlay;

export type GroundToImageInput = {
  overlayId: string;
  geometry: Geometry;
};

export type GroundToImageOutput = {
  geometry: Geometry;
};