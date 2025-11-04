import { type TRPCRootObject } from '@trpc/server';

export function exampleRouter<TContext extends object, TMeta extends object>(
  root: TRPCRootObject<TContext, TMeta, any, any>,
) {
  return root.router({
    example: root.procedure.query(() => {
      return 'Hello, world!';
    }),
  });
}
