import { Module } from '@nestjs/common';
import { PlaceholderCreatorService } from './placeholder-creator.service';

@Module({
  providers: [PlaceholderCreatorService],
  exports: [PlaceholderCreatorService],
})
export class PlaceholderCreatorModule {}
