import { Feature, Polygon } from 'geojson';
import type { PathOptions } from 'leaflet';
import type { CreateDocumentsInput, CreateDocumentMapPlaceholderData } from '../../documents/documents.router.schema';

const inlandCities = [
  [52.52, 13.405], // Berlin
  [50.1109, 8.6821], // Frankfurt
  [50.0755, 14.4378], // Prague
  [47.4979, 19.0402], // Budapest
  [40.4168, -3.7038], // Madrid
  [45.4642, 9.19], // Milan
  [50.8503, 4.3517], // Brussels
  [28.6139, 77.209], // New Delhi
  [-23.5505, -46.6333], // São Paulo
  [39.9042, 116.4074], // Beijing
  [41.8781, -87.6298], // Chicago
  [55.7558, 37.6173], // Moscow
  [35.6892, 51.389], // Tehran
  [12.9716, 77.5946], // Bangalore
  [28.5355, 77.391], // New Delhi
  [19.4326, -99.1332], // Mexico City
  [-15.7975, -47.8919], // Brasília
  [30.0444, 31.2357], // Cairo
  [-26.2041, 28.0473], // Johannesburg
  [-1.2921, 36.8219], // Nairobi
  [24.7136, 46.6753], // Riyadh
  [31.7683, 35.2137], // Jerusalem
  [50.0647, 19.945], // Krakow
  [54.8985, 23.9036], // Vilnius
  [59.437, 24.7536], // Tallinn
  [48.2082, 16.3738], // Vienna
  [47.3769, 8.5417], // Zurich
  [51.5074, -0.1278], // London
  [48.8566, 2.3522], // Paris
  [52.3676, 4.9041], // Amsterdam
  [40.7128, -74.006], // New York
  [53.3498, -6.2603], // Dublin
  [59.3293, 18.0686], // Stockholm
  [55.6761, 12.5683], // Copenhagen
  [38.7223, -9.1393], // Lisbon
  [41.3851, 2.1734], // Barcelona
  [59.9343, 30.3351], // Saint Petersburg
  [41.0082, 28.9784], // Istanbul
  [51.1657, 10.4515], // Central Germany (Erfurt area)
  [49.8371, 15.4627], // Czech Republic inland
  [46.2044, 6.1432], // Geneva area
  [50.7593, 25.3424], // Western Ukraine (Lviv area)
  [44.7866, 20.4489], // Belgrade
  [52.2297, 21.0122], // Warsaw
  [50.0647, 14.4378], // Prague area
  [53.4808, -2.2426], // Manchester (UK)
  [52.4862, -1.8904], // Birmingham (UK)
  [41.8781, -87.6298], // Chicago
  [39.7392, -104.9903], // Denver
  [36.1699, -115.1398], // Las Vegas
  [29.4241, -98.4936], // San Antonio
  [35.4676, -97.5164], // Oklahoma City
  [39.9526, -75.1652], // Philadelphia
  [40.4406, -79.9959], // Pittsburgh
  [41.2565, -95.9345], // Omaha
  [38.627, -90.1994], // St. Louis
  [39.0997, -94.5786], // Kansas City
  [30.2672, -97.7431], // Austin
  [32.7767, -96.797], // Dallas
  [35.1495, -90.049], // Memphis
  [35.2271, -80.8431], // Charlotte
  [33.749, -84.388], // Atlanta
  [39.7684, -86.1581], // Indianapolis
  [41.8781, -87.6298], // Chicago
  [43.0389, -87.9065], // Milwaukee
  [39.9612, -82.9988], // Columbus
  [41.0814, -81.519], // Akron
  [42.3314, -83.0458], // Detroit
  [43.161, -77.6109], // Rochester
  [42.8864, -78.8784], // Buffalo
  [43.0389, -87.9065], // Milwaukee
  [31.2304, 121.4737], // Shanghai
  [22.3193, 114.1694], // Hong Kong
  [1.3521, 103.8198], // Singapore
  [13.7563, 100.5018], // Bangkok
  [3.139, 101.6869], // Kuala Lumpur
];

const createPolygon = (
  center: [number, number],
  size: number,
  color: string,
): Feature<Polygon, { style: PathOptions }> => {
  const halfSize = size / 2;
  // GeoJSON uses [lng, lat] format, but center is [lat, lng] from map
  // So we need to create coordinates as [lng, lat]
  const coordinates: [number, number][] = [
    [center[1] - halfSize, center[0] - halfSize],
    [center[1] + halfSize, center[0] - halfSize],
    [center[1] + halfSize, center[0] + halfSize],
    [center[1] - halfSize, center[0] + halfSize],
    [center[1] - halfSize, center[0] - halfSize],
  ];

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    properties: {
      style: {
        color,
        fillColor: color,
        weight: 3,
        opacity: 1,
        fillOpacity: 0.6,
      },
    },
  };
};

function generateRandomMap(mapKey: string): CreateDocumentMapPlaceholderData {
  const randomCity = inlandCities[Math.floor(Math.random() * inlandCities.length)];
  const randomOffsetLat = (Math.random() - 0.5) * 0.3;
  const randomOffsetLng = (Math.random() - 0.5) * 0.3;
  const center: [number, number] = [randomCity[0] + randomOffsetLat, randomCity[1] + randomOffsetLng];

  const zoom = Math.floor(Math.random() * 7) + 10;

  const zoomBasedSize = Math.pow(2, 16 - zoom);
  const polygonSize = Math.max(0.02, Math.min(0.15, zoomBasedSize * 0.002));
  const polygonOffset = Math.min(polygonSize * 1.2, 0.05);

  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'pink', 'cyan'];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  let color2 = colors[Math.floor(Math.random() * colors.length)];
  while (color2 === color1) {
    color2 = colors[Math.floor(Math.random() * colors.length)];
  }

  const polygon1Center: [number, number] = [center[0] - polygonOffset, center[1] - polygonOffset];
  const polygon2Center: [number, number] = [center[0] + polygonOffset, center[1] + polygonOffset];

  const polygon1 = createPolygon(polygon1Center, polygonSize, color1);
  const polygon2 = createPolygon(polygon2Center, polygonSize, color2);

  return {
    type: 'map' as const,
    key: mapKey,
    value: {
      center,
      zoom,
      geojson: [polygon1, polygon2],
    },
  };
}

export const createDocumentInputExample: CreateDocumentsInput = {
  templateId: '692ea2e9564a0840eb8d2cf0',
  zipFileName: 'documents.zip',
  data: Array.from({ length: 300 }, (_, index) => ({
    placeholderData: [
      generateRandomMap('מפה'),
      {
        type: 'text',
        key: 'כותרת',
        value: `World Maps ${index + 1}`,
      },
      {
        type: 'text',
        key: 'תיאור',
        value: `This is a description of the world maps document ${index + 1}`,
      },
    ],
    filename: `world_maps_${index + 1}.pptx`,
  })),
};
