import { Module } from '@nestjs/common';
import { OverlaysService } from './overlays.service';
import { MockOverlaysModule } from './implementations/mock/mock-overlays.module';
import { MockOverlaysService } from './implementations/mock/mock-overlays.service';


@Module({
  imports: [MockOverlaysModule],
  providers: [
    {
      provide: OverlaysService,
      useExisting: MockOverlaysService,
    },
  ],
  exports: [OverlaysService],
})
export class OverlaysModule {}
