import { AppModule } from './logic/app.module';
import { config } from './config';
import { appRouter } from './logic/app.router';
import { runServer, type ServerConfig } from '@auto-document/server/server';

runServer({
  config: config as ServerConfig,
  modules: [AppModule],
  rootRouter: appRouter,
});
