import type { GetOverlayByIdInput, Overlay, GroundToImageInput, GroundToImageOutput } from './overlays.model';

export abstract class OverlaysService {
  abstract getById(input: GetOverlayByIdInput): Promise<Overlay>;
  abstract groundToImage(input: GroundToImageInput): Promise<GroundToImageOutput>;
}
