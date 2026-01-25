import { AppModule } from './services/app.module';
import { config } from './config';
import router from '@auto-document/domain/document-crud.router';
import { runCrud } from '@auto-document/bootstrap/crud';

runCrud({
  config,
  appModule: AppModule,
  appRouter: router,
});
