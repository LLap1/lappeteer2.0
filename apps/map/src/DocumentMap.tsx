import { useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import {
  addGeoJsonLayer,
  addTileLayer,
  closeMap,
  exportMap,
  setView,
  wait,
  waitForTilelayersToLoad,
} from '../types/map.types';
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
      <BindWindowFunctionToMap windowFunction={closeMap} id={id} />
      <BindWindowFunctionToMap windowFunction={wait} id={id} />
    </MapContainer>
  );
};
