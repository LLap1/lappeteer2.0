import {} from '../../services/documents/documents.router.schema';

export const createDocumentInputWithNoMapsExample = {
  templateId: '0494364e-50d1-4c45-b25c-146fb760b171',
  zipFilename: 'documents.zip',
  params: Array.from({ length: 1 }, (_, index) => ({
    placeholders: [
      {
        type: 'text',
        key: 'כותרת',
        params: `World Maps ${index + 1}`,
      },
      {
        type: 'text',
        key: 'תיאור',
        params: `This is a description of the world maps document This is a description of the world maps document ${
          index + 1
        }`,
      },
    ],
    documentFilename: `world_maps_${index + 1}.pptx`,
  })),
};
