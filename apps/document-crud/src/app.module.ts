import { Module } from '@nestjs/common';
import { config } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateModule } from './templates/templates.module';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Config } from './config';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';
import documentProcessorRouter from '@auto-document/document-processor/router';
import documentMapCreatorRouter from '@auto-document/document-map-creator/router';
import { createOpenApiClient } from '@auto-document/orpc/clients/open-api';
import { ORPCModule, onError } from '@orpc/nest';
import { ContractRouterClient } from '@orpc/contract';

export const rootClient: ContractRouterClient<{
  documentProcessor: typeof documentProcessorRouter;
  documentMapCreator: typeof documentMapCreatorRouter;
}> = {
  documentProcessor: createOpenApiClient<typeof documentProcessorRouter>(
    config.documentProcessor.url,
    documentProcessorRouter,
  ),
  documentMapCreator: createOpenApiClient<typeof documentMapCreatorRouter>(
    config.documentMapCreator.url,
    documentMapCreatorRouter,
  ),
};

export type Client = typeof rootClient;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        return {
          uri: configService.get<Config['mongodb']>('mongodb')?.uri,
        };
      },
    }),
    OrpcClientModule.forRoot(rootClient),
    ORPCModule.forRoot({
      interceptors: [
        onError(error => {
          console.error(error);
        }),
      ],
    }),
    TemplateModule,
    DocumentsModule,
  ],
})
export class AppModule {}
