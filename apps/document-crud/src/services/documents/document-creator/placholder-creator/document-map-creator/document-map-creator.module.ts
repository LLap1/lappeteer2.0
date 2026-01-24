import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { OverlaysModule } from 'src/services/wms/overlays/overlays.module';

@Module({
  imports: [OverlaysModule],
  providers: [DocumentMapCreatorService],
  exports: [DocumentMapCreatorService],
})
export class DocumentMapCreatorModule {}
