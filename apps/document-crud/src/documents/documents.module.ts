import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { TemplateModule } from '../templates/templates.module';
import { FileStorageModule } from '@auto-document/nest/file.module';
import { ConfigService } from '@nestjs/config';
import type { Config } from '../config';

@Module({
  imports: [DocumentCreatorModule, TemplateModule, FileStorageModule],
  providers: [
    {
      provide: 'BASE_URL',
      useFactory: (configService: ConfigService<Config>) => configService.get('server').baseUrl,
      inject: [ConfigService],
    },
    DocumentsService,
  ],
  exports: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}

