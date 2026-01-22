export interface GenerateRequest {
  templateFile: Bun.S3File;
  outputFilename: string;
  data: PlaceholderData[];
  slidesToRemove?: number[];
}

export interface PlaceholderData {
  id: string;
  key: string;
  type: string;
  value: string;
  width: number;
  height: number;
  rotation?: number;
}

export interface MapValue {
  layerDataUrls: string[];
}

export type GenerateResponse = Bun.BunFile;

export type AnalyzeRequest = Uint8Array;

export interface AnalyzeResponse {
  placeholders: PlaceholderMetadata[];
}

export interface PlaceholderMetadata {
  key: string;
  type: string;
  width: number;
  height: number;
}
