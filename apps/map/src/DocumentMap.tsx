import { useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import {
  addGeoJsonLayer,
  addTileLayer,
  exportMap,
  setMapSize,
  setView,
  waitForTilelayersToLoad,
} from '../types/window.types';
import { BindWindowFunctionToMap } from './BindWindowFunctionToMap';
import 'leaflet/dist/leaflet.css';

export const DocumentMap = ({ id }: { id: string }) => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);

  return (
    <MapContainer trackResize={true} zoomControl={false} style={{ width: `${width}px`, height: `${height}px` }}>
      <BindWindowFunctionToMap windowFunction={addTileLayer} id={id} />
      <BindWindowFunctionToMap windowFunction={exportMap} id={id} />
      <BindWindowFunctionToMap windowFunction={setView} id={id} />
      <BindWindowFunctionToMap windowFunction={addGeoJsonLayer} id={id} />
      <BindWindowFunctionToMap windowFunction={waitForTilelayersToLoad} id={id} />
      <BindWindowFunctionToMap windowFunction={setMapSize} dependencies={{ setWidth, setHeight }} id={id} />
    </MapContainer>
  );
};
