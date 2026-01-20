import type { GetOverlayByIdInput, GetOverlayByIdOutput } from './overlays.model';


export abstract class OverlaysService {
  abstract getById(input: GetOverlayByIdInput): Promise<GetOverlayByIdOutput>;
}


