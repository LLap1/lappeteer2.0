import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';

interface DocumentPoolContextType {
  ids: string[];
}
const DocumentPoolContext = createContext<DocumentPoolContextType | undefined>(undefined);

export const DocumentPoolProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>([]);

  const contextValue: DocumentPoolContextType = useMemo(
    () => ({
      ids,
    }),
    [ids],
  );

  useEffect(() => {
    // @ts-ignore
    window['createMapPool'] = ({ ids }: { ids: string[] }) => {
      setIds(ids);
      return new Promise(resolve => setTimeout(resolve, 300));
    };
  }, []);

  return <DocumentPoolContext.Provider value={contextValue}>{children}</DocumentPoolContext.Provider>;
};

export const useDocumentPoolContext = () => {
  const context = useContext(DocumentPoolContext);
  if (!context) {
    throw new Error('useDocumentPoolContext must be used within a DocumentPoolProvider');
  }
  return context;
};
