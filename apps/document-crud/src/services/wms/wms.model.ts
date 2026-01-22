export type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type GetMapInput = {
  overlayId: string;
  bbox: BBox;
  width: number;
  height: number;
  format: string;
};

export type GetMapOutput = {
  imagePath: string;
};

