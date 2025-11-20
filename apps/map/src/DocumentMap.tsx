import { useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import {
  addGeoJsonLayer,
  addTileLayer,
  removeLayers,
  exportMap,
  setView,
  wait,
  waitForTilelayersToLoad,
} from './models/window-functions.model';
import { BindWindowFunctionToMap } from './BindWindowFunctionToMap';
import 'leaflet/dist/leaflet.css';

export const DocumentMap = ({ id, width, height }: { id: string; width: number; height: number }) => {
  return (
    <MapContainer trackResize={true} zoomControl={false} style={{ width: `${width}px`, height: `${height}px` }}>
      <BindWindowFunctionToMap windowFunction={addTileLayer} id={id} />
      <BindWindowFunctionToMap windowFunction={exportMap} id={id} />
      <BindWindowFunctionToMap windowFunction={setView} id={id} />
      <BindWindowFunctionToMap windowFunction={addGeoJsonLayer} id={id} />
      <BindWindowFunctionToMap windowFunction={waitForTilelayersToLoad} id={id} />
      <BindWindowFunctionToMap windowFunction={removeLayers} id={id} />
      <BindWindowFunctionToMap windowFunction={wait} id={id} />
      <BindWindowFunctionToMap windowFunction={removeLayers} id={id} />
    </MapContainer>
  );
};
