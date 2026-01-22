import { Module } from '@nestjs/common';
import { OverlaysService } from './overlays.service';
import { config, type Config } from '../../../config';
import { MockOverlaysService } from './implementations/mock-overlays.service';

type OverlaysServiceType = Config['overlaysService']['type'];

const OVERLAYS_SERVICE_IMPLEMENTATIONS: Record<OverlaysServiceType, new (...args: never[]) => OverlaysService> = {
  mock: MockOverlaysService,
};

@Module({
  providers: [
    MockOverlaysService,
    {
      provide: OverlaysService,
      useExisting: OVERLAYS_SERVICE_IMPLEMENTATIONS[config.overlaysService.type],
    },
  ],
  exports: [OverlaysService],
})
export class OverlaysModule {}
