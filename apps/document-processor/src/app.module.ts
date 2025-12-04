import { Module } from '@nestjs/common';
import { DocumentProcessorModule } from './doucment-proceesor/document-processor.module';
import { ConfigModule } from '@nestjs/config';
import { ORPCModule, onError } from '@orpc/nest';
import { config } from './config';
import { OtelModuleConfig } from '@auto-document/nest/open-telemetry.module';
import { OpenTelemetryModule } from 'nestjs-otel';
@Module({
  imports: [
    OpenTelemetryModule.forRoot(OtelModuleConfig),
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
