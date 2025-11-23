import { ControlledMap } from './ControlledMap';
import { useMapPoolContext } from './context/map-pool.context';
import { useEffect } from 'react';
import { registerRouter } from './models/router.model';
import { mapRouter } from './routers/map.router';

export const ControlledMapPool = () => {
  const { maps, dispatch } = useMapPoolContext();

  useEffect(() => {
    registerRouter(mapRouter, { maps, dispatch });
  }, [maps, dispatch]);

  return (
    <div className="flex flex-row gap-4">
      {Array.from({ length: maps.length }).map((_, i) => (
        <ControlledMap key={i} id={maps[i].id} width={maps[i].width} height={maps[i].height} />
      ))}
    </div>
  );
};
