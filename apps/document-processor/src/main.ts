import { AppModule } from './app.module';
import { runMicroservice, type ServeOptions } from '@auto-document/bootstrap/microservice';
import { config } from './config';

const serveOptions: ServeOptions = {
  config,
  appModule: AppModule,
};

runMicroservice(serveOptions);
