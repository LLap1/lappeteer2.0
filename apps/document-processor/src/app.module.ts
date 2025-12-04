import { Module } from '@nestjs/common';
import { DocumentProcessorModule } from './doucment-proceesor/document-processor.module';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule, onError } from '@orpc/nest';
import { config } from './config';
@Module({
  imports: [
    DocumentProcessorModule,
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
