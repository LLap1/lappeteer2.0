import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import '@zohan/ui/globals.css';
import './styles.css';
import { queryClient } from './trpc/client';

import { setDefaultOptions } from 'date-fns';
import { he } from 'date-fns/locale';

setDefaultOptions({
  locale: he,
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
