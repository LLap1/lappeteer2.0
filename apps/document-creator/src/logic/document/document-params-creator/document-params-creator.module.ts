import { Module } from '@nestjs/common';
import { DocumentParamsTransformerService } from './document-params-creator.service';
import { MapCreatorModule } from 'src/logic/map-creator/map-creator.module';
@Module({
  imports: [MapCreatorModule],
  providers: [DocumentParamsTransformerService],
  exports: [DocumentParamsTransformerService],
})
export class DocumentParamsCreatorModule {}
