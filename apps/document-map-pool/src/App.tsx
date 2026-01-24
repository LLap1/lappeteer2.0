import { ControlledMapPool } from './ControlledMapPool';
import { MapPoolProvider } from './context/map-pool.context';
export const App = () => {
  return (
    <MapPoolProvider>
      <ControlledMapPool />
    </MapPoolProvider>
  );
};
