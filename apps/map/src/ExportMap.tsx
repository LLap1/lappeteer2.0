import { useState } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
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

export const ExportMap = () => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);

  return (
    <MapContainer re trackResize={true} zoomControl={false} style={{ width: `${width}px`, height: `${height}px` }}>
      <BindWindowFunctionToMap windowFunction={addTileLayer} />
      <BindWindowFunctionToMap windowFunction={exportMap} />
      <BindWindowFunctionToMap windowFunction={setView} />
      <BindWindowFunctionToMap windowFunction={addGeoJsonLayer} />
      <BindWindowFunctionToMap windowFunction={waitForTilelayersToLoad} />
      <BindWindowFunctionToMap windowFunction={setMapSize} dependencies={{ setWidth, setHeight }} />
    </MapContainer>
  );
};
