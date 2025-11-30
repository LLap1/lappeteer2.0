import { type DynamicModule, type Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

export class RootModule {
  static forRoot(config: object, ...modules: Type<any>[]): DynamicModule {
    return {
      module: RootModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => config],
        }),
        ...modules,
      ],
    };
  }
}
