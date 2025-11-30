export type PropertyPath<T> = T extends Array<infer U>
  ? `${PropertyPath<U>}`
  : T extends object
  ? {
      [K in keyof T & (string | number)]: K extends string ? `${K}` | `${K}.${PropertyPath<T[K]>}` : never;
    }[keyof T & (string | number)]
  : never;
