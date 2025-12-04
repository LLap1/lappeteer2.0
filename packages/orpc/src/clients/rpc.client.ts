import { createORPCClient, onError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { ContractRouterClient } from '@orpc/contract';
import type { AnyContractRouter } from '@orpc/contract';

export function createRpcClient<T extends AnyContractRouter>(url: string): ContractRouterClient<T> {
  const link = new RPCLink({
    url: `${url}`,
    interceptors: [
      onError(error => {
        console.error(error);
      }),
    ],
  });

  const client: ContractRouterClient<T> = createORPCClient(link);
  return client;
}
