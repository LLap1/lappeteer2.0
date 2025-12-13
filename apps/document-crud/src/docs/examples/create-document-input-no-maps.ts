import { Feature, Polygon } from 'geojson';
import type { PathOptions } from 'leaflet';
import {} from '../../documents/documents.router.schema';
import z from 'zod';

export const createDocumentInputWithNoMapsExample = {
  templateId: '693d5dfacb77435822da5cef',
  zipFilename: 'documents.zip',
  params: Array.from({ length: 10 }, (_, index) => ({
    placeholders: [
      {
        type: 'text',
        key: 'כותרת',
        params: `World Maps ${index + 1}`,
      },
      {
        type: 'text',
        key: 'תיאור',
        params: `This is a description of the world maps document ${index + 1}`,
      },
    ],
    documentFilename: `world_maps_${index + 1}.pptx`,
  })),
};
