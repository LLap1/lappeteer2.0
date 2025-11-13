import { Module } from '@nestjs/common';
import { config } from '../config';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { TemplateFileStorageModule } from './template/template-file-storage/template-file-storage.module';
import { TemplateModule } from './template/template.module';
import { FileStorageModule } from './file/file-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => config,
    }),
    FileStorageModule,
    DocumentModule,
    TemplateModule,
  ],
})
export class AppModule {}
