import { Module } from '@nestjs/common';
import { DocumentGeneratorService } from './document-generator.service';
import { ProcessModule } from '@auto-document/nest/process.module';
import { DocumentGeneratorController } from './document-generator.controller';

@Module({
  imports: [ProcessModule],
  providers: [DocumentGeneratorService],
  controllers: [DocumentGeneratorController],
  exports: [DocumentGeneratorService],
})
export class DocumentGeneratorModule {}
