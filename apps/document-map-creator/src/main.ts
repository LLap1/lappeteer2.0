import { AppModule } from './app.module';
import { config } from './config';
import { runServer, type ServerConfig } from '@auto-document/server/server';
import appRouter from './app.router';

runServer({
  config: config as ServerConfig,
  appRouter,
  appModule: AppModule,
});
