import { Module } from '@nestjs/common';
import { ProcessService } from './service';

@Module({
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}
