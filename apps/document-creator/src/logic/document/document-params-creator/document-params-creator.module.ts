import { Module } from '@nestjs/common';
import { DocumentParamsCreatorService } from './document-params-creator.service';
import { MapCreatorModule } from 'src/logic/map-creator/map-creator.module';
@Module({
  imports: [MapCreatorModule],
  providers: [DocumentParamsCreatorService],
  exports: [DocumentParamsCreatorService],
})
export class DocumentParamsCreatorModule {}
