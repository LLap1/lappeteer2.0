import { MockOverlaysModule } from './implementations/mock/mock-overlays.module';
import { type Config } from '../../../config';
import { OverlaysService } from './overlays.service';
import { MockOverlaysService } from './implementations/mock/mock-overlays.service';

type OverlaysServiceType = Config['overlaysService']['type'];

export const OVERLAYS_MODULES = [
    MockOverlaysModule,
]

export const OVERLAYS_SERVICE_IMPLEMENTATIONS: Record<OverlaysServiceType, new (...args: never[]) => OverlaysService> = {
  mock: MockOverlaysService,
};