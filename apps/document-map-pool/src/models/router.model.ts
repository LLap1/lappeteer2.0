export type RouterAction<P = any> = {
  type: string;
  params: P;
};

export type Router<A extends RouterAction<any>, D = undefined> = {
  [K in A['type']]: (params: Extract<A, { type: K }>['params'], dependencies: D) => Promise<any>;
};

export function registerRouter<A extends RouterAction<any>, D = undefined>(router: Router<A, D>, dependencies: D) {
  const actions = Object.keys(router);
  for (const action of actions) {
    (window as any)[action] = (params: any) => {
      return router[action as keyof typeof router](params, dependencies);
    };
    console.log(action, (window as any)[action]);
  }
}
