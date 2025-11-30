# @auto-document/utils

A utility package providing type-safe object manipulation functions.

## Installation

This package is part of the monorepo workspace. No additional installation needed.

## Usage

### `set` - Set a nested property value

Sets a value at a given path in an object and returns a new object with the modified type.

```typescript
import { set } from '@auto-document/utils';

const obj = {
  user: {
    profile: {
      name: 'John',
      age: 30,
    },
  },
};

// Set a nested property
const updated = set(obj, 'user.profile.age', 31);
// TypeScript knows: updated.user.profile.age is number

// Set using array path
const updated2 = set(obj, ['user', 'profile', 'age'], 31);

// Set a top-level property
const updated3 = set(obj, 'user', { profile: { name: 'Jane', age: 25 } });
```

### `update` - Update a nested property with a function

Updates a value at a given path using a transformation function.

```typescript
import { update } from '@auto-document/utils';

const obj = {
  user: {
    profile: {
      name: 'John',
      age: 30,
    },
  },
};

// Update with a function
const updated = update(obj, 'user.profile.age', age => age + 1);
// TypeScript knows: age parameter is number, return type is number

// Update using array path
const updated2 = update(obj, ['user', 'profile', 'age'], age => age + 1);

// Complex transformation
const updated3 = update(obj, 'user.profile.name', name => name.toUpperCase());
```

## Features

- ✅ **Type-safe**: Full TypeScript type inference for paths and values
- ✅ **Immutable**: Returns new objects without mutating originals
- ✅ **Flexible paths**: Supports both string (`'a.b.c'`) and array (`['a', 'b', 'c']`) paths
- ✅ **Nested objects**: Handles deeply nested object structures
- ✅ **Type preservation**: Return type reflects the modified object structure

## Type Safety

The functions provide full type safety:

```typescript
interface User {
  name: string;
  age: number;
  address: {
    city: string;
    zip: number;
  };
}

const user: User = {
  name: 'John',
  age: 30,
  address: { city: 'NYC', zip: 10001 },
};

// TypeScript will enforce correct types
const updated = set(user, 'address.zip', 10002); // ✅ OK
const updated2 = set(user, 'address.zip', 'invalid'); // ❌ Type error

// TypeScript knows the function parameter type
const updated3 = update(user, 'age', age => age + 1); // ✅ age is number
```

## API

### `set<T, P>(obj: T, path: P, value: SetValue<T, P>): T`

Sets a value at the given path.

- `obj`: The object to modify
- `path`: String path (e.g., `'a.b.c'`) or array path (e.g., `['a', 'b', 'c']`)
- `value`: The value to set (type is inferred from the path)

### `update<T, P>(obj: T, path: P, updater: SetFunction<T, P>): T`

Updates a value at the given path using a transformation function.

- `obj`: The object to modify
- `path`: String path (e.g., `'a.b.c'`) or array path (e.g., `['a', 'b', 'c']`)
- `updater`: Function that receives the current value and returns the new value

## Exported Types

- `Path`: `string | readonly string[]`
- `PathValue<T, P>`: The type of value at path `P` in object `T`
- `SetValue<T, P>`: Alias for `PathValue<T, P>`
- `SetFunction<T, P>`: Function type `(value: PathValue<T, P>) => PathValue<T, P>`
