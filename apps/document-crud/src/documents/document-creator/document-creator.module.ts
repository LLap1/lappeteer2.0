import { Module } from '@nestjs/common';
import { DocumentCreatorService } from './document-creator.service';
import { PlaceholderCreatorModule } from './placholder-creator/placeholder-creator.module';

@Module({
  imports: [PlaceholderCreatorModule],
  providers: [DocumentCreatorService],
  exports: [DocumentCreatorService],
})
export class DocumentCreatorModule {}
