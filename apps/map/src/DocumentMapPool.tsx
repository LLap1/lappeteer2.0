import { DocumentMap } from './DocumentMap';
import { useDocumentPoolContext } from './context/document-pool.context';

export const DocumentMapPool = () => {
  const { ids } = useDocumentPoolContext();

  console.log('Rendering DocumentMapPool with ids:', ids);

  return (
    <div className="flex flex-row gap-4 w-full h-full">
      {Array.from({ length: ids.length }).map((_, i) => (
        <DocumentMap key={i} id={ids[i]} />
      ))}
    </div>
  );
};
