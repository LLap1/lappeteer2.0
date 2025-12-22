import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import path from 'path';
import { config } from './config';
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
        useFactory: () => {
          const host = config.documentProcessor.host;
          const port = config.documentProcessor.port;
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
      },
      { 
        name: 'DOCUMENT_MAP_CREATOR_CLIENT',
        useFactory: () => {
          const host = config.documentMapCreator.host;
          const port = config.documentMapCreator.port;
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
