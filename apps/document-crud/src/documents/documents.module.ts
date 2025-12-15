import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { TemplateModule } from '../templates/templates.module';
import { ConfigService } from '@nestjs/config';
import type { Config } from '../config';
import { S3Module } from 'node_modules/@auto-document/nest/src/s3/s3.module';

@Module({
  imports: [DocumentCreatorModule, TemplateModule, S3Module],
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
