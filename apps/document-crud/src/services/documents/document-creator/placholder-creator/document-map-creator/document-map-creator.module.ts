import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { OverlaysModule } from 'src/services/overlays';
import { WmsModule } from 'src/services/wms/wms.module';

@Module({
  imports: [WmsModule, OverlaysModule],
  providers: [DocumentMapCreatorService],
  exports: [DocumentMapCreatorService],
})
export class DocumentMapCreatorModule {}
