export type GenerateDocumentInput = {
  templateFile: File;
  filename: string;
  data: {
    type: 'map' | 'string';
    key: string;
    value: string;
  }[];
};

export type GenerateDocumentOutput = File;
