import { Module } from '@nestjs/common';
import { MockOverlaysService } from './mock-overlays.service';

@Module({
  providers: [
    MockOverlaysService,
  ],
  exports: [MockOverlaysService],
})
export class MockOverlaysModule {}
