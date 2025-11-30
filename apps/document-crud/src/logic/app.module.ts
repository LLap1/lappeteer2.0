import { Module } from '@nestjs/common';
import { config } from '../config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateModule } from './template/template.module';
import { DocumentModule } from './document/document.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';
import templateFileContract from '@auto-document/document-template-file/contract';
import documentCreatorContract from '@auto-document/document-creator/contract';
import { createRpcClient } from '@auto-document/orpc/clients/rpc';

const templateFileClient = createRpcClient<typeof templateFileContract>(config.templateFile.url);
const documentCreatorClient = createRpcClient<typeof documentCreatorContract>(config.documentCreator.url);

export const rootClient = {
  templateFile: templateFileClient,
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
    TemplateModule,
    DocumentModule,
  ],
})
export class AppModule {}
