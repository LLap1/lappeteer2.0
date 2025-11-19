import { Module } from '@nestjs/common';
import { DocumentGeneratorService } from './document-generator.service';
import { ProcessModule } from 'src/logic/process/process.module';

@Module({
  imports: [ProcessModule],
  providers: [DocumentGeneratorService],
  exports: [DocumentGeneratorService],
})
export class DocumentGeneratorModule {}
