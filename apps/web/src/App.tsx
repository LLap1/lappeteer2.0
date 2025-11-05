import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import '@zohan/ui/globals.css';
import './styles.css';

import { setDefaultOptions } from 'date-fns';
import { he } from 'date-fns/locale';

setDefaultOptions({
  locale: he,
});

export const App = () => {
  return <RouterProvider router={router} />;
};
