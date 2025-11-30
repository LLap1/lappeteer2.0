import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';
import { TemplateModule } from '../template/template.module';
import { DocumentController } from './document.controller';

@Module({
  imports: [OrpcClientModule, TemplateModule],
  providers: [DocumentService],
  exports: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule {}
