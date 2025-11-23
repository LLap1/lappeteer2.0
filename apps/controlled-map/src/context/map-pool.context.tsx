import { createContext, useContext, type ReactNode, useMemo, useReducer, type Dispatch, useEffect } from 'react';
import { createMapPoolReducer, type MapPoolAction, type MapPoolState } from '../reducers/map-pool.reducer';

type MapPoolContextType = {
  maps: MapPoolState;
  dispatch: Dispatch<MapPoolAction>;
};

const MapPoolContext = createContext<MapPoolContextType | undefined>(undefined);

export const MapPoolProvider = ({ children }: { children: ReactNode }) => {
  const [maps, dispatch] = useReducer(createMapPoolReducer, []);

  const contextValue: MapPoolContextType = useMemo(() => {
    return { maps, dispatch };
  }, [maps, dispatch]);

  return <MapPoolContext.Provider value={contextValue}>{children}</MapPoolContext.Provider>;
};

export const useMapPoolContext = () => {
  const context = useContext(MapPoolContext);
  if (!context) {
    throw new Error('useControlledMapPoolContext must be used within a ControlledMapPoolProvider');
  }
  return context;
};
