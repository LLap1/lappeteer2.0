import { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson';
import type { PathOptions } from 'leaflet';
import { CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';
const londonBoundary: Feature<Geometry, { style: PathOptions }> = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-0.09490097131637754, 51.516653629684214],
          [-0.08794682905013929, 51.516653629684214],
          [-0.08794682905013929, 51.51364035099729],
          [-0.09490097131637754, 51.51364035099729],
          [-0.09490097131637754, 51.516653629684214],
        ],
      ],
    ],
  },
  properties: { style: { color: 'red', weight: 2, opacity: 1 } },
};

const parisBoundary: Feature<Geometry, { style: PathOptions }> = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [2.3376, 48.8606],
        [2.3468, 48.8606],
        [2.3468, 48.8526],
        [2.3376, 48.8526],
        [2.3376, 48.8606],
      ],
    ],
  },
  properties: { style: { color: 'green', weight: 2, opacity: 1 } },
};

const newYorkBoundary: Feature<Geometry, { style: PathOptions }> = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-73.9654, 40.7829],
        [-73.9497, 40.7829],
        [-73.9497, 40.7644],
        [-73.9654, 40.7644],
        [-73.9654, 40.7829],
      ],
    ],
  },
  properties: { style: { color: 'blue', weight: 2, opacity: 1 } },
};

export const createDocumentInputExample: CreateDocumentsInput = [
  {
    templateFileName: 'sample.pptx',
    filename: 'world_maps.pptx',
    data: [
      {
        type: 'map',
        key: 'new_york_map',
        value: {
          center: [40.77365, -73.95755],
          zoom: 13,
          geojson: [newYorkBoundary],
          width: null,
          height: null,
        },
      },
      {
        type: 'map',
        key: 'london_map',
        value: {
          center: [51.51514699034075, -0.09142390018325841],
          zoom: 13,
          geojson: [londonBoundary],
          width: null,
          height: null,
        },
      },
      {
        type: 'map',
        key: 'paris_map',
        value: {
          center: [48.8566, 2.3422],
          zoom: 13,
          geojson: [parisBoundary],
          width: null,
          height: null,
        },
      },
      {
        type: 'string',
        key: 'title',
        value: 'World Maps',
      },
      {
        type: 'string',
        key: 'description',
        value: 'This is a description of the world maps',
      },
    ],
  },
];
