export type Path = string | readonly string[];

type PathValueFromArray<T, P extends readonly string[]> = P extends readonly [infer K, ...infer Rest]
  ? K extends keyof T
    ? Rest extends readonly string[]
      ? PathValueFromArray<T[K], Rest>
      : T[K]
    : never
  : T;

type PathValueFromString<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValueFromString<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

export type PathValue<T, P extends Path> = P extends readonly string[]
  ? PathValueFromArray<T, P>
  : P extends string
  ? PathValueFromString<T, P>
  : never;

export type SetValue<T, P extends Path> = PathValue<T, P>;
export type SetFunction<T, P extends Path> = (value: PathValue<T, P>) => PathValue<T, P>;

function getNestedValue<T>(obj: T, path: readonly string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setNestedValue<T extends Record<string, unknown>>(obj: T, path: readonly string[], value: unknown): T {
  if (path.length === 0) {
    return value as T;
  }

  const [first, ...rest] = path;
  const result: Record<string, unknown> = { ...obj };

  if (rest.length === 0) {
    result[first] = value;
  } else {
    const nested = result[first];
    if (nested === null || nested === undefined || typeof nested !== 'object') {
      result[first] = setNestedValue({}, rest, value);
    } else if (Array.isArray(nested)) {
      result[first] = [...nested];
      (result[first] as unknown[])[parseInt(rest[0], 10)] = setNestedValue({}, rest.slice(1), value);
    } else {
      result[first] = setNestedValue(nested as Record<string, unknown>, rest, value);
    }
  }

  return result as T;
}

function parsePath(path: Path): readonly string[] {
  if (typeof path === 'string') {
    return path.split('.').filter(Boolean);
  }
  return path;
}

export function set<T extends Record<string, unknown>, P extends Path>(
  obj: T,
  path: P,
  value: SetValue<T, P> | SetFunction<T, P>,
): T {
  const pathArray = parsePath(path);
  return setNestedValue(obj, pathArray, value);
}

export function update<T extends Record<string, unknown>, P extends Path>(
  obj: T,
  path: P,
  updater: SetFunction<T, P>,
): T {
  const pathArray = parsePath(path);
  const currentValue = getNestedValue(obj, pathArray) as PathValue<T, P>;
  const newValue = updater(currentValue);
  return setNestedValue(obj, pathArray, newValue);
}
