import templateFileContract from '@auto-document/document-template-file/contract';
import documentCreatorContract from '@auto-document/document-creator/contract';
import { config } from '../config';
import { createRpcClient } from '@auto-document/orpc/clients/rpc';

const templateFileClient = createRpcClient<typeof templateFileContract>(config.templateFile.url);
const documentCreatorClient = createRpcClient<typeof documentCreatorContract>(config.documentCreator.url);

export const rootClient = {
  templateFile: templateFileClient,
  documentCreator: documentCreatorClient,
};

export type Client = typeof rootClient;
