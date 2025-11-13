export type GenerateDocumentInput = {
  templateFile: File;
  data: {
    filename: string;
    map: {
      type: 'map';
      key: string;
      value: string;
    }[];
    strings: {
      type: 'string';
      value: string;
      key: string;
    }[];
  };
};

export type GenerateDocumentOutput = File;
