import type {
  GetOverlayByIdInput,
  Overlay,
  GroundToImageInput,
  GroundToImageOutput,
  GetPixelWmsUrlInput,
} from './overlays.model';

export abstract class OverlaysService {
  abstract getById(input: GetOverlayByIdInput): Promise<Overlay>;
  abstract buildPixelWmsUrl(input: GetPixelWmsUrlInput): Promise<string>;
  abstract groundToImage(input: GroundToImageInput): Promise<GroundToImageOutput>;
}
