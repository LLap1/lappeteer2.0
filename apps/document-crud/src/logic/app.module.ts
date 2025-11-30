import { Module } from '@nestjs/common';
import { config } from '../config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateModule } from './template/template.module';
import { DocumentModule } from './document/document.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';
import templateAnalyzerRouter from '@auto-document/document-template-analyzer/router';
import documentCreatorRouter from '@auto-document/document-creator/router';
import { createRpcClient } from '@auto-document/orpc/clients/rpc';
import { ORPCModule, onError } from '@orpc/nest';

const templateAnalyzerClient = createRpcClient<typeof templateAnalyzerRouter>(config.templateAnalyzer.url);
const documentCreatorClient = createRpcClient<typeof documentCreatorRouter>(config.documentCreator.url);

export const rootClient = {
  templateAnalyzer: templateAnalyzerClient,
  documentCreator: documentCreatorClient,
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
    DocumentModule,
  ],
})
export class AppModule {}
