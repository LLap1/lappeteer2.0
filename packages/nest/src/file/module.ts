import { Global, Module } from '@nestjs/common';
import { FileService } from './service';

@Module({
  providers: [FileService],
  exports: [FileService],
})
@Global()
export class FileStorageModule {}
