import { Module } from '@nestjs/common';
import { config } from '../config';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { DocumentTemplateStorageModule } from './document-template-storage/document-template-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => config,
    }),
    DocumentModule,
    DocumentTemplateStorageModule,
  ],
})
export class AppModule {}
