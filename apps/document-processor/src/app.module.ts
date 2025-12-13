import { Module } from '@nestjs/common';
import { DocumentProcessorModule } from './services/document-processor.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';

@Module({
  imports: [
    DocumentProcessorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
  ],
})
export class AppModule {}
