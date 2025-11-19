import { Module } from '@nestjs/common';
import { config } from '../config';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentModule } from './document/document.module';
import { TemplateFileStorageModule } from './template/template-file/template-file.module';
import { TemplateModule } from './template/template.module';
import { FileStorageModule } from './file/file-storage.module';
import { ProcessModule } from './process/process.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => config,
    }),
    MongooseModule.forRoot(config.mongodb.uri),
    DocumentModule,
    TemplateModule,
  ],
})
export class AppModule {}
