import { Global, Module } from '@nestjs/common';
import { BunFileService } from './service';

@Module({
  providers: [BunFileService],
  exports: [BunFileService],
})
@Global()
export class BunFileModule {}
