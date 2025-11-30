export type RouterAction<P> = {
  type: string;
  params: P;
};

export type Router<D, A extends RouterAction<any>> = {
  [K in A['type']]: (params: Extract<A, { type: K }>['params'], dependencies: D) => Promise<any>;
};

export function registerRouter<D, A extends RouterAction<any>>(router: Router<D, A>, dependencies: D) {
  const actions = Object.keys(router);
  for (const action of actions) {
    (window as any)[action] = (params: any) => {
      console.log('running action', router, action, params, dependencies);
      return router[action as keyof typeof router](params, dependencies);
    };
    console.log(action, (window as any)[action]);
  }
}
