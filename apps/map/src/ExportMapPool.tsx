import { ExportMap } from './ExportMap';

export const ExportMapPool = () => {
  const mapCount = 1;

  return (
    <div className="flex flex-row gap-4 w-full h-full">
      {Array.from({ length: mapCount }).map((_, i) => (
        <ExportMap key={i} />
      ))}
    </div>
  );
};
