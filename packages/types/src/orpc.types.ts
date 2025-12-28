import { type ORPCErrorConstructorMap } from '@orpc/server';
import { type InferContractRouterErrorMap, type AnyContractRouter } from '@orpc/contract';

export type RouterErrors<T extends AnyContractRouter> = ORPCErrorConstructorMap<InferContractRouterErrorMap<T>>;
