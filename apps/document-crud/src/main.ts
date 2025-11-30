import { AppModule } from './logic/app.module';
import { config } from './config';
import { appRouter } from './logic/app.router';
import { runServer, type ServerConfig } from '@auto-document/server/server';
import { createDocumentInputExample } from './docs/examples/create-document-input.example';
import { CreateDocumentsInputSchema } from './logic/document/documents.router.schema';
import { JSON_SCHEMA_REGISTRY } from '@orpc/zod/zod4';

JSON_SCHEMA_REGISTRY.add(CreateDocumentsInputSchema, {
  examples: [createDocumentInputExample],
});

runServer({
  config: config as ServerConfig,
  modules: [AppModule],
  rootRouter: appRouter,
});
