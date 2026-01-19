
export const createDocumentInputWithNoMapsExample = {
  templateId: '1549ed97-9c60-4c67-8f02-cc5b30a35bfd',
  zipFilename: 'documents.zip',
  params: Array.from({ length: 4 }, (_, index) => ({
    placeholders: [
      {
        type: 'text',
        key: 'כותרת',
        params: `World Maps ${index + 1}`,
      },
      {
        type: 'text',
        key: 'תיאור',
        params: `This is a description of the world maps document This is a  ${index + 1}`,
      },
    ],
    slidesToRemove: [0, 2],
    documentFilename: `world_maps_${index + 1}.pptx`,
  })),
};
