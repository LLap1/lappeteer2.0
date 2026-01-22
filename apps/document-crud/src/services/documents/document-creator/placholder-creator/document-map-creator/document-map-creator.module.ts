import { Module } from '@nestjs/common';
import { DocumentMapCreatorService } from './document-map-creator.service';
import { WmsModule } from 'src/services/wms/wms.module';

@Module({
  imports: [WmsModule],
  providers: [DocumentMapCreatorService],
  exports: [DocumentMapCreatorService],
})
export class DocumentMapCreatorModule {}
