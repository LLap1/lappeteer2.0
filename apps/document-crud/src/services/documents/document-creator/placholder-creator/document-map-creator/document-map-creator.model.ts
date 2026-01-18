export type CreateMapsInput = {
  id: string;
  width: number;
  height: number;
  center: [number, number];
  zoom: number;
  geojson: any[];
}[];

export type CreateMapsOutput = {
  id: string;
  layerDataUrls: string[];
}[];
