import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import path from 'path';
import { ReflectionService } from '@grpc/reflection';
import type { Type } from '@nestjs/common';

export type ServerConfig = {
  server: {
    port: number;
    host: string;
    appName: string;
  };
};

export interface ServeOptions {
  config: ServerConfig;
  appModule: Type<any>;
}

export async function runMicroservice({ config, appModule }: ServeOptions) {
  const protoPath = path.join(__dirname, `../../../proto/${config.server.appName}.proto`);
  const packageName = config.server.appName.split('/').pop()!.replaceAll('-', '');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(appModule, {
    transport: Transport.GRPC,
    options: {
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
      package: packageName,
      protoPath: protoPath,
      url: `${config.server.host}:${config.server.port}`,
    },
  });

  await app.listen();
  console.log(`Microservice is listening on port ${config.server.port}`);
}
