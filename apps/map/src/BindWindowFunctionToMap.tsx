import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { type WindowFunction } from '../types/map.types';
import { Map } from 'leaflet';

type setWindowEventProps<T, R, D = any> = {
  windowFunction: WindowFunction<T, R>;
  id: string;
  dependencies?: D | undefined;
};

export function BindWindowFunctionToMap<T, R, D = any>({
  windowFunction,
  id,
  dependencies,
}: setWindowEventProps<T, R, D>) {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    window[`${id}-${windowFunction.type}`] = async (windowData: D) => {
      const params = {
        map,
        ...dependencies,
        // @ts-ignores
        ...windowData,
      };
      return windowFunction.handler(params as T & D & { map: Map });
    };
  }, []);

  return <></>;
}
