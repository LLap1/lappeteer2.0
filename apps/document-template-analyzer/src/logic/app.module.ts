import { Module } from '@nestjs/common';
import { TemplateAnalyzerModule } from './template-analyzer/template-analyzer.module';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule, onError } from '@orpc/nest';
import { config } from '../config';

@Module({
  imports: [
    TemplateAnalyzerModule,
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
