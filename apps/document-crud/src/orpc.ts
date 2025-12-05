import { createOpenApiClient } from '@auto-document/orpc/clients/open-api';
import documentProcessorRouter from 'node_modules/@auto-document/document-processor/src/doucment-proceesor/document-processor.router';
import documentMapCreatorRouter from 'node_modules/@auto-document/document-map-creator/src/document-map-creator/document-map-creator.router';
import { ContractRouterClient } from '@orpc/contract';
import { config } from './config';

export const rootClient: ContractRouterClient<{
  documentProcessor: typeof documentProcessorRouter;
  documentMapCreator: typeof documentMapCreatorRouter;
}> = {
  documentProcessor: createOpenApiClient<typeof documentProcessorRouter>(
    config.documentProcessor.url,
    documentProcessorRouter,
  ),
  documentMapCreator: createOpenApiClient<typeof documentMapCreatorRouter>(
    config.documentMapCreator.url,
    documentMapCreatorRouter,
  ),
};

export type Client = typeof rootClient;
