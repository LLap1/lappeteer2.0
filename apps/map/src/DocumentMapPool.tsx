import { DocumentMap } from './DocumentMap';
import { useDocumentPoolContext } from './context/document-pool.context';

export const DocumentMapPool = () => {
  const pool = useDocumentPoolContext();

  console.log('Rendering DocumentMapPool with ids:');

  return (
    <div className="flex flex-row gap-4">
      {Array.from({ length: pool.length }).map((_, i) => (
        <DocumentMap key={i} id={pool[i].id} width={pool[i].width} height={pool[i].height} />
      ))}
    </div>
  );
};
