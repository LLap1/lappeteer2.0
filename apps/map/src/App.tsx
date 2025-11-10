import { DocumentMapPool } from './DocumentMapPool';
import { DocumentPoolProvider } from './context/document-pool.context';

export const App = () => {
  return (
    <DocumentPoolProvider>
      <DocumentMapPool />
    </DocumentPoolProvider>
  );
};
