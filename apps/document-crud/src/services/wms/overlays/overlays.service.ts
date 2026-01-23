import type { GetOverlayByIdInput, GetOverlayByIdOutput, GroundToImageInput, GroundToImageOutput } from './overlays.model';

  
export abstract class OverlaysService {
  abstract getById(input: GetOverlayByIdInput): Promise<GetOverlayByIdOutput>;
  abstract groundToImage(input: GroundToImageInput): Promise<GroundToImageOutput>;
}


