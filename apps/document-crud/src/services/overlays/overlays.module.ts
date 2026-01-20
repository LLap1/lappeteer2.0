import { Module } from '@nestjs/common';
import { OverlaysService } from './overlays.service';
import { config } from '../../config';
import { MockOverlaysService } from './implementations/mock-overlays.service';

@Module({
  providers: [
    MockOverlaysService,
    {
      provide: OverlaysService,
      useFactory: (mockOverlaysService: MockOverlaysService) => {
        switch (config.overlaysService.type) {
          case 'mock':
            return mockOverlaysService;
          default:
            throw new Error(`Unsupported overlays service type: ${config.overlaysService.type}`);
        }
      },
      inject: [MockOverlaysService],
    },
  ],
  exports: [OverlaysService],
})
export class OverlaysModule {}
