export type GenerateDocumentInput = {
  templateFile: File;
  documentFileName: string;
  data: Array<{
    type: 'map' | 'text' | 'image';
    key: string;
    value: string;
  }>;
};

export type GenerateDocumentOutput = File;
