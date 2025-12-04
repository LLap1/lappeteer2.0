import { Module } from '@nestjs/common';
import { DocumentMapCreatorModule } from './document-map-creator/document-map-creator.module';
import { config } from './config';
import { onError, ORPCModule } from '@orpc/nest';
import { ConfigModule } from '@nestjs/config';
import { OtelModuleConfig } from '@auto-document/nest/open-telemetry.module';
import { OpenTelemetryModule } from 'nestjs-otel';
@Module({
  imports: [
    DocumentMapCreatorModule,
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
    OpenTelemetryModule.forRoot(OtelModuleConfig),
  ],
})
export class AppModule {}
