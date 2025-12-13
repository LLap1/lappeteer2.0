import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import path from 'path';
import { ReflectionService } from '@grpc/reflection';
import type { Type } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

export type ServerConfig = {
  server: {
    port: number;
    host: string;
    packageName: string;
    microserviceName: string;
  };
};

export interface ServeOptions {
  config: ServerConfig;
  appModule: Type<any>;
}

export async function runMicroservice({ config, appModule }: ServeOptions) {
  const protoPath = path.join(__dirname, `../../../proto/${config.server.microserviceName}.proto`);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(appModule, {
    transport: Transport.GRPC,
    options: {
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
      url: `${config.server.host}:${config.server.port}`,
      package: config.server.packageName,
      protoPath: protoPath,
      maxReceiveMessageLength: 50 * 1024 * 1024,
      maxSendMessageLength: 50 * 1024 * 1024,
    },
  });
  app.useLogger(app.get(Logger));

  await app.listen();
  console.log(`Microservice is listening on port ${config.server.port}`);
}
