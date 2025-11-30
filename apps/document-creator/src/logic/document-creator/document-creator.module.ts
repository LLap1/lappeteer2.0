import { Module } from '@nestjs/common';
import { DocumentCreatorService } from './document-creator.service';
import { DocumentParamsCreatorModule } from '../document-params-transformer/document-params-transformer.module';
import { DocumentCreatorController } from './document-creator.controller';
@Module({
  imports: [DocumentParamsCreatorModule],
  providers: [DocumentCreatorService],
  exports: [DocumentCreatorService],
  controllers: [DocumentCreatorController],
})
export class DocumentCreatorModule {}
