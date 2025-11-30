import { type DynamicModule } from '@nestjs/common';
import { OrpcClientService } from './service';
import type { ContractRouterClient } from '@orpc/contract';

export class OrpcClientModule {
  static forRoot(rootClient: ContractRouterClient<any>): DynamicModule {
    return {
      module: OrpcClientModule,
      global: true,
      providers: [
        {
          provide: OrpcClientService,
          useFactory: () => {
            return new OrpcClientService(rootClient);
          },
        },
      ],
      exports: [OrpcClientService],
    };
  }
}
