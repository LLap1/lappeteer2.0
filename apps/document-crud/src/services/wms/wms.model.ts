export type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type GetMapInput = {
  layers: string[];
  bbox: BBox;
  width: number;
  height: number;
  crs?: string;
  format?: string;
  styles?: string[];
};

export type GetMapOutput = {
  imagePath: string;
};

