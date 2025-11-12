import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import '@zohan/ui/globals.css';
import './styles.css';

import { setDefaultOptions } from 'date-fns';
import { he } from 'date-fns/locale';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

setDefaultOptions({
  locale: he,
});

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
