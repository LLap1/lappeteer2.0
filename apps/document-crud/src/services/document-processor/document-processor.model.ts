export interface GenerateRequest {
  templateFile: Uint8Array;
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
}

export interface MapValue {
  layerDataUrls: string[];
}

export type GenerateResponse = File;

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
