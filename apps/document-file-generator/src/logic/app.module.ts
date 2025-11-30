import { Module } from '@nestjs/common';
import { DocumentGeneratorModule } from './document-generator/document-generator.module';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule, onError } from '@orpc/nest';
import { config } from '../config';

@Module({
  imports: [
    DocumentGeneratorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
    ORPCModule.forRoot({
      interceptors: [
        onError(error => {
          console.error(error);
        }),
      ],
    }),
  ],
})
export class AppModule {}

