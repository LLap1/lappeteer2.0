import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import path, { join } from 'path';
import { AppModule } from './app.module';
import { config } from './config';
import { ReflectionService } from '@grpc/reflection';
import { runMicroservice, type ServeOptions } from '@auto-document/bootstrap/microservice';

const serveOptions: ServeOptions = {
  config,
  appModule: AppModule,
};

runMicroservice(serveOptions);
