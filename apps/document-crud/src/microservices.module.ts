import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import path, { join } from 'path';
import type { Config } from './config';
import { type DocumentProcessorServiceClient } from '@auto-document/types/proto/document-processor';
import { type DocumentMapCreatorServiceClient } from '@auto-document/types/proto/document-map-creator';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'DOCUMENT_PROCESSOR_CLIENT',
        useFactory: (configService: ConfigService<Config>) => {
          const host = configService.get('documentProcessor')!.host;
          const port = configService.get('documentProcessor')!.port;
          return {
            transport: Transport.GRPC,
            options: {
              package: 'documentprocessor',
              protoPath: path.join(__dirname, '../../../proto/document-processor.proto'),
              url: `${host}:${port}`,
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'DOCUMENT_MAP_CREATOR_CLIENT',
        useFactory: (configService: ConfigService<Config>) => {
          const host = configService.get('documentMapCreator')!.host;
          const port = configService.get('documentMapCreator')!.port;
          return {
            transport: Transport.GRPC,
            options: {
              package: 'documentmapcreator',
              protoPath: path.join(__dirname, '../../../proto/document-map-creator.proto'),
              url: `${host}:${port}`,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    {
      provide: 'DocumentProcessorServiceClient',
      useFactory: (client: ClientGrpc) => {
        return client.getService<DocumentProcessorServiceClient>('DocumentProcessorService');
      },
      inject: ['DOCUMENT_PROCESSOR_CLIENT'],
    },
    {
      provide: 'DocumentMapCreatorServiceClient',
      useFactory: (client: ClientGrpc) => {
        return client.getService<DocumentMapCreatorServiceClient>('DocumentMapCreatorService');
      },
      inject: ['DOCUMENT_MAP_CREATOR_CLIENT'],
    },
  ],
  exports: ['DocumentProcessorServiceClient', 'DocumentMapCreatorServiceClient'],
})
export class MicroservicesModule {}
