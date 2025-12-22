import { AppModule } from './app.module';
import { config } from './config';
import { appRouter } from './app.router';
import { runCrud } from '@auto-document/bootstrap/crud';

runCrud({
  config,
  appModule: AppModule,
  appRouter,
});
