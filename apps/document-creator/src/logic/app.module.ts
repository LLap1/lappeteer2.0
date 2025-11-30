import { Module } from '@nestjs/common';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { createOpenApiClient } from '@auto-document/orpc/clients/open-api';
import documentFileGeneratorRouter from '@auto-document/document-file-generator/router';
import { config } from '../config';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';
import { onError, ORPCModule } from '@orpc/nest';
import { ConfigModule } from '@nestjs/config';

const rootClient = {
  documentFileGenerator: createOpenApiClient<typeof documentFileGeneratorRouter>(
    config.documentFileGenerator.url,
    documentFileGeneratorRouter,
  ),
};
export type RootClient = typeof rootClient;

@Module({
  imports: [
    DocumentCreatorModule,
    OrpcClientModule.forRoot(rootClient),
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
