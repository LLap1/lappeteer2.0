import { Injectable, Logger } from '@nestjs/common';
import { type GetOverlayByIdInput, type GetOverlayByIdOutput } from '../overlays.model';
import { Log } from '@auto-document/utils/log';
import { OverlaysService } from '../overlays.service';

@Injectable()
export class MockOverlaysService extends OverlaysService {
  private static readonly logger: Logger = new Logger(MockOverlaysService.name);

  @Log(MockOverlaysService.logger)
  async getById(request: GetOverlayByIdInput): Promise<GetOverlayByIdOutput> {
    return {
      id: request.id,
      streamingUrl: `http://localhost:8080/geoserver/ne/wms`,
    };
  }

}

