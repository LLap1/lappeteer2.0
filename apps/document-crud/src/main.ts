import { AppModule } from './logic/app.module';
import { config } from './config';
import appRouter from './logic/app.router';
import { runServer } from '@auto-document/server/server';

runServer({
  config,
  appModule: AppModule,
  appRouter,
});
