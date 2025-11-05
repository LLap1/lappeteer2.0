import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppHeader } from '@/components/app-header';
import { Toaster } from '@zohan/ui/components/sonner';

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
