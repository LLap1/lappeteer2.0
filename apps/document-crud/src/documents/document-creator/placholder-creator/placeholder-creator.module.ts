import { Module } from '@nestjs/common';
import { PlaceholderCreatorService } from './placeholder-creator.service';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';

@Module({
  imports: [OrpcClientModule],
  providers: [PlaceholderCreatorService],
  exports: [PlaceholderCreatorService],
})
export class PlaceholderCreatorModule {}
