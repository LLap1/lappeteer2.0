import type { GetMapInput, GetMapOutput } from './wms.model';

export abstract class WmsService {
  abstract getMap(input: GetMapInput): Promise<GetMapOutput>;
}
