## Zohan Monorepo Template

Turborepo-based monorepo template with:

- **Frontend**: React + Vite + Tailwind + shadcn/ui
- **Routing**: TanStack Router (file-based via Vite plugin)
- **Data**: tRPC v11 + TanStack Query v5
- **Backend**: Express + tRPC (with `superjson`)

### Requirements

- Node.js 18+
- pnpm 9+

### Install

```bash
pnpm install
```

### Develop

Run all apps with Turbo:

```bash
pnpm dev
```

Or run individually:

```bash
# API (Express + tRPC) on http://localhost:3000
pnpm --filter @overlays/api dev

# Web (Vite) on http://localhost:5173 (proxies /trpc to :3000)
pnpm --filter @overlays/web dev
```

Vite proxy is configured for `/trpc` and `/api` to `http://localhost:3000` in `apps/web/vite.config.ts`.

### Build

```bash
pnpm build
```

### Workspace layout

- `apps/api`: Express+tRPC server, Drizzle-ready. Serves tRPC at `/trpc` and can serve static files from `public/`.
- `apps/web`: React + Vite app. TanStack Router file-based routing is enabled via `@tanstack/router-vite-plugin`.
- `packages/ui`: Shared UI library (shadcn/ui based) exposed under `@overlays/ui`.
- `packages/eslint-config`, `packages/typescript-config`: Shared config.

---

## Frontend: TanStack Router (file-based)

File-based routing is enabled via the Vite plugin. The route tree is generated to `apps/web/src/routeTree.gen.ts`. The root route lives at `apps/web/src/routes/__root.tsx` and the home page at `apps/web/src/routes/index.tsx`.

#### Add a new route

1. Create a file in `apps/web/src/routes`. For an About page:

```tsx
// apps/web/src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router';

function AboutPage() {
  return <div className="p-6 text-xl">About</div>;
}

export const Route = createFileRoute('/about')({
  component: AboutPage,
});
```

2. Navigate with typed links:

```tsx
import { Link } from '@tanstack/react-router';

export const Nav = () => (
  <nav className="flex gap-4 p-4">
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
  </nav>
);
```

3. Dynamic params (file name `[id].tsx`):

```tsx
// apps/web/src/routes/posts/[id].tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$id')({
  component: () => {
    const { id } = Route.useParams();
    return <div className="p-6">Post {id}</div>;
  },
});
```

Devtools are enabled via `TanStackRouterDevtools` in `__root.tsx`.

References: [TanStack Router — File-based routing](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing), [Creating a router](https://tanstack.com/router/latest/docs/framework/react/guide/creating-a-router)

---

## Backend: tRPC v11

tRPC server is mounted at `/trpc` in `apps/api/index.ts` and uses `superjson` via `initTRPC(...).create({ transformer: superjson })`.

#### Add a new router with a query and mutation

```ts
// apps/api/trpc/routers/user.ts
import { z } from 'zod';
import { publicProcedure, router } from '../init';

export const userRouter = router({
  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return { id: input.id, name: 'Ada Lovelace' };
  }),

  create: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ input }) => {
    return { id: 'new-id', name: input.name };
  }),
});
```

Wire it into the app router:

```ts
// apps/api/trpc/routers/_app.ts
import { router } from '../init';
import { exampleRouter } from './example';
import { userRouter } from './user';

export const appRouter = router({
  example: exampleRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

---

## Frontend: tRPC + TanStack Query (options proxy)

Provide the `QueryClient` and router in `apps/web/src/App.tsx` (already wired):

```tsx
// apps/web/src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { queryClient } from './trpc/client';

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
```

#### Use a query (React Query v5)

```tsx
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/trpc/client';

export const UserCard = ({ id }: { id: string }) => {
  const userQuery = useQuery(trpc.user.byId.queryOptions({ id }));

  if (userQuery.isLoading) return <div>Loading…</div>;
  if (userQuery.error) return <div>Error</div>;

  return <div className="p-4">{userQuery.data.name}</div>;
};
```

#### Use a mutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/trpc/client';

export const CreateUserButton = () => {
  const queryClient = useQueryClient();
  const createUser = useMutation(
    trpc.user.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.user.byId.getQueryKey({ id: 'new-id' }) }),
    }),
  );

  const handleClick = () => createUser.mutate({ name: 'New User' });

  return (
    <button className="btn" onClick={handleClick} disabled={createUser.isPending}>
      {createUser.isPending ? 'Creating…' : 'Create User'}
    </button>
  );
};
```

Notes:

- The options proxy (`createTRPCOptionsProxy`) produces strongly typed `queryOptions`/`mutationOptions` for direct use with TanStack Query’s `useQuery`/`useMutation`.
- The API base is `/trpc` (proxied in dev to the API server).

References: [tRPC + TanStack Query (v11) setup](https://trpc.io/docs/client/tanstack-react-query/setup), [httpBatchLink](https://trpc.io/docs/client/links/httpBatchLink), [TanStack Query v5](https://tanstack.com/query/latest/docs/react/overview)

---

## Environment

Backend expects `.env` in `apps/api` (example):

```env
PORT=3000
DATABASE_URL="postgres://user:pass@host:5432/db"
NODE_ENV=development
```

---

## Scripts (common)

- Root: `pnpm dev`, `pnpm build`
- API: `pnpm --filter @overlays/api dev | build`
- Web: `pnpm --filter @overlays/web dev | build | preview`
