import { MapContainer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useMapPoolContext } from './context/map-pool.context';
import 'leaflet-rotate';

const InnerMap = ({ id }: { id: string }) => {
  const map = useMap();
  const { dispatch } = useMapPoolContext();

  useEffect(() => {
    if (Boolean(map)) {
      dispatch({ type: 'update', params: { id, map } });
    }
  }, [dispatch, map]);
  return <></>;
};

export const ControlledMap = ({ id, width, height }: { id: string; width: number; height: number }) => {
  return (
    <MapContainer
      id={id}
      trackContainerMutation={true}
      rotate={true}
      preferCanvas={false}
      trackResize={true}
      zoomControl={false}
      style={{ width: `${width}px`, height: `${height}px`, background: 'transparent' }}
    >
      <InnerMap id={id} />
    </MapContainer>
  );
};
