import { Module } from '@nestjs/common';
import { config } from './config';
import { MongooseModule, MongooseModuleFactoryOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import { TemplateModule } from './templates/templates.module';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Config } from './config';
import { ORPCModule, onError } from '@orpc/nest';
import { S3Module } from '@auto-document/nest/s3.module';
import { MicroservicesModule } from './microservices.module';
import { REQUEST } from '@nestjs/core';
import { LoggerModule } from '@auto-document/nest/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
    S3Module,
    MicroservicesModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const mongoOptions = configService.get<Config>('mongo')! as MongooseModuleFactoryOptions;
        return mongoOptions;
      },
    }),
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
