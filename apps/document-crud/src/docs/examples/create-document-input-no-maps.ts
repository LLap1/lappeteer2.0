import {} from '../../services/documents/documents.router.schema';

export const createDocumentInputWithNoMapsExample = {
  templateId: 'b5a38848-6723-4cb6-a969-cf7170826280',
  zipFilename: 'documents.zip',
  params: Array.from({ length: 100 }, (_, index) => ({
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
