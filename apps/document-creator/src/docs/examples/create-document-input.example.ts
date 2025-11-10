import { CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';
import { Feature, MultiPolygon, Polygon } from 'geojson';

const londonBoundary = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [51.516653629684214, -0.09490097131637754],
          [51.51364035099729, -0.08794682905013929],
          [51.516653629684214, -0.08794682905013929],
          [51.516653629684214, -0.09490097131637754],
        ],
      ],
    ],
  },
  properties: {
    name: 'London Area',
  },
} as Feature<MultiPolygon>;

const parisBoundary = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [48.8606, 2.3376],
        [48.8606, 2.3468],
        [48.8526, 2.3468],
        [48.8526, 2.3376],
        [48.8606, 2.3376],
      ],
    ],
  },
  properties: {
    name: 'Louvre District',
    description: 'Historic district around the Louvre Museum',
  },
} as Feature<Polygon>;

const newYorkBoundary = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [40.7829, -73.9654],
        [40.7829, -73.9497],
        [40.7644, -73.9497],
        [40.7644, -73.9654],
        [40.7829, -73.9654],
      ],
    ],
  },
  properties: {
    name: 'Central Park',
    description: 'Major urban park in Manhattan',
  },
} as Feature<Polygon>;

const areaOfInterestBoundary = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [51.516653629684214, -0.09490097131637754],
        [51.51364035099729, -0.08794682905013929],
        [51.516653629684214, -0.08794682905013929],
        [51.516653629684214, -0.09490097131637754],
      ],
    ],
  },
  properties: {
    name: 'Area of Interest',
    description: 'A polygon marking an important area',
  },
} as Feature<Polygon>;

export const createDocumentInputExample: CreateDocumentsInput = {
  templateFileName: 'sample.pptx',
  data: [
    {
      map: {
        type: 'map',
        key: 'london-map',
        value: {
          filename: 'london-map.png',
          center: [51.505, -0.09],
          zoom: 13,
          geojson: [londonBoundary],
        },
      },
      strings: [
        {
          type: 'string',
          key: 'location-name',
          value: 'London',
        },
        {
          type: 'string',
          key: 'תיאור',
          value: 'המרכז של לונדון',
        },
      ],
    },
    {
      map: {
        type: 'map',
        key: 'paris-map',
        value: {
          filename: 'paris-map.png',
          center: [48.8566, 2.3522],
          zoom: 12,
          geojson: [parisBoundary],
        },
      },
      strings: [
        {
          type: 'string',
          key: 'location-name',
          value: 'Paris',
        },
        {
          type: 'string',
          key: 'תיאור',
          value: 'Historic district around the Louvre Museum',
        },
      ],
    },
    {
      map: {
        type: 'map',
        key: 'new-york-map',
        value: {
          filename: 'newyork-map.png',
          center: [40.7128, -74.006],
          zoom: 11,
          geojson: [newYorkBoundary],
        },
      },
      strings: [
        {
          type: 'string',
          key: 'location-name',
          value: 'New York',
        },
        {
          type: 'string',
          key: 'תיאור',
          value: 'סנטרל פארק במנהטן',
        },
      ],
    },
  ],
};

export const createDocumentInputMinimalExample: CreateDocumentsInput = {
  templateFileName: 'sample.pptx',
  data: [
    {
      map: {
        type: 'map',
        key: 'default-map',
        value: {
          filename: 'map-document.png',
          center: [51.505, -0.09],
        },
      },
      strings: [
        {
          type: 'string',
          key: 'location-name',
          value: 'Default Location',
        },
      ],
    },
  ],
};

export const createDocumentInputWithGeoJsonExample: CreateDocumentsInput = {
  templateFileName: 'sample.pptx',
  data: [
    {
      map: {
        type: 'map',
        key: 'area-of-interest',
        value: {
          filename: 'area-of-interest.png',
          center: [51.505, -0.09],
          zoom: 13,
          geojson: [areaOfInterestBoundary],
        },
      },
      strings: [
        {
          type: 'string',
          key: 'location-name',
          value: 'Area of Interest',
        },
        {
          type: 'string',
          key: 'תיאור',
          value: 'שטח מודגש',
        },
      ],
    },
  ],
};
