import { AppModule } from './logic/app.module';
import { config } from './config';
import { runServer, type ServerConfig } from '@auto-document/server/server';
import rootRouter from './logic/app.router';

runServer({
  config: config as ServerConfig,
  rootRouter,
  modules: [AppModule],
});
