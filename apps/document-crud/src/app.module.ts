import { Module } from '@nestjs/common';
import { config } from './config';
import { TemplateModule } from './templates/templates.module';
import { DocumentsModule } from './documents/documents.module';
import { ORPCModule, onError } from '@orpc/nest';
import { S3Module } from '@auto-document/nest/s3.module';
import { REQUEST } from '@nestjs/core';
import { LoggerModule } from '@auto-document/nest/logger.module';
import { DrizzleModule } from '@auto-document/nest/drizzle.module';
import path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    LoggerModule.forRoot(config.logger),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
    }),
    DrizzleModule.forRoot(config.drizzle),
    S3Module,
    ORPCModule.forRootAsync({
      useFactory: (request: Request) => ({
        interceptors: [
          onError(error => {
            console.error(error);
          }),
        ],
        context: { request },
      }),
      inject: [REQUEST],
    }),
    TemplateModule,
    DocumentsModule,
  ],
})
export class AppModule {}
