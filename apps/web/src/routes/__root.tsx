import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppHeader } from '@/components/app-header';
import { Toaster } from '@zohan/ui/components/sonner';
import { useLog } from '@zohan/ui/hooks/use-log';
import { trpcClient } from '../trpc/client';
import { TRPCLogger } from '@zohan/ui/lib/trpc-logger';
import type { TRPCClient } from '@trpc/client';
import type { LoggerRouter } from '@zohan/trpc/logger';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

interface MyRouterContext {
  auth: AuthState;
}

function RootComponent() {
  const trpcLogger = new TRPCLogger(trpcClient.logger as TRPCClient<LoggerRouter>);

  const { logInfo, logError } = useLog(trpcLogger, {
    project: 'overlays-web',
  });

  logInfo({
    props: {
      flexibleProps: 'can be anything',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
    },
    message: 'Log Example',
  });

  logError(
    {
      props: {
        flexibleProps: 'can be anything',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
      },
      message: 'Error Example',
    },
    new Error('Error Example'),
  );

  return (
    <>
      <AppHeader />
      <div className="p-4">
        <Outlet />
      </div>
      <Toaster />
      <TanStackRouterDevtools />
    </>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});
