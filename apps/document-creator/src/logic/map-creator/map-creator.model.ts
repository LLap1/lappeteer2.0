import { Feature, FeatureCollection, Geometry } from 'geojson';
import { PathOptions } from 'leaflet';

export type CreateMapParams = {
  id: string;
  center: [number, number];
  zoom: number;
  width: number;
  height: number;
  geojson?: FeatureCollection<
    Geometry,
    {
      style: PathOptions;
    }
  >[];
};

export type Base64MapImage = string;
