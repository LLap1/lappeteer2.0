import { AppModule } from './app.module';
import { config } from './config';
import appRouter from './app.router';
import { runServer, type ServerConfig } from '@auto-document/server/server';

runServer({
  config: config as ServerConfig,
  appModule: AppModule,
  appRouter,
});
