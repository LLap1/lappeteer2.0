import { AppModule } from './app.module';
import { config } from './config';
import { runMicroservice, type ServeOptions } from '@auto-document/bootstrap/microservice';

const serveOptions: ServeOptions = {
  config,
  appModule: AppModule,
};

runMicroservice(serveOptions);
