import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import type { Config } from './config';
import {
  DOCUMENT_PROCESSOR_SERVICE_NAME,
  DOCUMENTPROCESSOR_PACKAGE_NAME,
  type DocumentProcessorServiceClient,
} from '@auto-document/types/proto/document-processor';
import {
  DOCUMENTMAPCREATOR_PACKAGE_NAME,
  DOCUMENT_MAP_CREATOR_SERVICE_NAME,
  type DocumentMapCreatorServiceClient,
} from '@auto-document/types/proto/document-map-creator';

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
              url: `${host}:${port}`,
              package: DOCUMENTPROCESSOR_PACKAGE_NAME,
              protoPath: path.join(__dirname, '../../../proto/document-processor.proto'),
              maxReceiveMessageLength: 50 * 1024 * 1024,
              maxSendMessageLength: 50 * 1024 * 1024,
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
              url: `${host}:${port}`,
              package: DOCUMENTMAPCREATOR_PACKAGE_NAME,
              protoPath: path.join(__dirname, '../../../proto/document-map-creator.proto'),
              maxReceiveMessageLength: 50 * 1024 * 1024,
              maxSendMessageLength: 50 * 1024 * 1024,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    {
      provide: DOCUMENT_PROCESSOR_SERVICE_NAME,
      useFactory: (client: ClientGrpc) => {
        return client.getService<DocumentProcessorServiceClient>('DocumentProcessorService');
      },
      inject: ['DOCUMENT_PROCESSOR_CLIENT'],
    },
    {
      provide: DOCUMENT_MAP_CREATOR_SERVICE_NAME,
      useFactory: (client: ClientGrpc) => {
        return client.getService<DocumentMapCreatorServiceClient>('DocumentMapCreatorService');
      },
      inject: ['DOCUMENT_MAP_CREATOR_CLIENT'],
    },
  ],
  exports: [DOCUMENT_MAP_CREATOR_SERVICE_NAME, DOCUMENT_PROCESSOR_SERVICE_NAME],
})
export class MicroservicesModule {}
