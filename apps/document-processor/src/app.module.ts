import { Module } from '@nestjs/common';
import { DocumentProcessorModule } from './doucment-proceesor/document-processor.module';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule, onError } from '@orpc/nest';
import { config } from './config';
import { REQUEST } from '@nestjs/core';

@Module({
  imports: [
    DocumentProcessorModule,
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
