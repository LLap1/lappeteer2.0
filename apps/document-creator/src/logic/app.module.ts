import { Module } from '@nestjs/common';
import { DocumentCreatorModule } from './document-creator/document-creator.module';
import { createOpenApiClient } from '@auto-document/orpc/clients/open-api';
import { appRouter } from '@auto-document/document-template-file/contract';
import { config } from '../config';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';

const rootClient = {
  templateFile: createOpenApiClient<typeof appRouter>(config.templateFile.url, appRouter),
};

export type RootClient = typeof rootClient;
@Module({
  imports: [DocumentCreatorModule, OrpcClientModule.forRoot(rootClient)],
  exports: [DocumentCreatorModule],
})
export class AppModule {}
