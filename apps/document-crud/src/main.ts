import { AppModule } from './app.module';
import { config } from './config';
import appRouter from './app.router';
import { runServer } from '@auto-document/server/server';

runServer({
  config,
  appModule: AppModule,
  appRouter,
});
