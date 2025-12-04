import { type DynamicModule } from '@nestjs/common';
import type { ContractRouterClient } from '@orpc/contract';

export const ORPC_CLIENT = 'ORPC_CLIENT_TOKEN';

export class OrpcClientModule {
  static forRoot(rootClient: ContractRouterClient<any>): DynamicModule {
    return {
      module: OrpcClientModule,
      global: true,
      providers: [
        {
          provide: ORPC_CLIENT,
          useFactory: () => {
            return rootClient;
          },
        },
      ],
      exports: [ORPC_CLIENT],
    };
  }
}
