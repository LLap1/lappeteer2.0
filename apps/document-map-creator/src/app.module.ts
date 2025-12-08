import { Module } from '@nestjs/common';
import { DocumentMapCreatorModule } from './document-map-creator/document-map-creator.module';
import { config } from './config';
import { onError, ORPCModule } from '@orpc/nest';
import { ConfigModule } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';

@Module({
  imports: [
    DocumentMapCreatorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
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
  ],
})
export class AppModule {}
