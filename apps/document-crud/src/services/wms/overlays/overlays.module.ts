import { Module } from '@nestjs/common';
import { OverlaysService } from './overlays.service';
import { config } from '../../../config';
import { OVERLAYS_MODULES, OVERLAYS_SERVICE_IMPLEMENTATIONS } from './overlays.imports';




@Module({
  imports: [...OVERLAYS_MODULES],
  providers: [
    {
      provide: OverlaysService,
      useExisting: OVERLAYS_SERVICE_IMPLEMENTATIONS[config.overlaysService.type],
    },
  ],
  exports: [OverlaysService],
})
export class OverlaysModule {}
