import type { ContractRouterClient } from '@orpc/contract';

export class OrpcClientService<T extends ContractRouterClient<any>> {
  constructor(public readonly client: T) {}
}
