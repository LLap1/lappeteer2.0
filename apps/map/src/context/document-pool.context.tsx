import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';

type DocumentPoolContextType = {
  id: string;
  width: number;
  height: number;
}[];

const DocumentPoolContext = createContext<DocumentPoolContextType | undefined>(undefined);

export const DocumentPoolProvider = ({ children }: { children: ReactNode }) => {
  const [pool, setPool] = useState<DocumentPoolContextType>([]);

  const contextValue: DocumentPoolContextType = useMemo(() => pool, [pool]);

  // @ts-ignore
  window['createMapPool'] = (inputs: DocumentPoolContextType) => {
    setPool(inputs);
    return new Promise(resolve => setTimeout(resolve, 300));
  };

  return <DocumentPoolContext.Provider value={contextValue}>{children}</DocumentPoolContext.Provider>;
};

export const useDocumentPoolContext = () => {
  const context = useContext(DocumentPoolContext);
  if (!context) {
    throw new Error('useDocumentPoolContext must be used within a DocumentPoolProvider');
  }
  return context;
};
