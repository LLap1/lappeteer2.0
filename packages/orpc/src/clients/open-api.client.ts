import { createORPCClient, onError } from '@orpc/client';
import type { AnyContractRouter, ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import type { JsonifiedClient } from '@orpc/openapi-client';

export function createOpenApiClient<T extends AnyContractRouter>(url: string, contract: T) {
  const link = new OpenAPILink(contract, {
    url: `${url}`,
    interceptors: [
      onError(error => {
        console.error(error);
      }),
    ],
  });

  const client: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link);
  return client;
}
