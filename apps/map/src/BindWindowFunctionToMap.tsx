import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { WindowFunction } from '../types/window.types';
import { Map } from 'leaflet';

type setWindowEventProps<T, R, D = any> = {
  windowFunction: WindowFunction<T, R>;
  dependencies?: D | undefined;
};

export function BindWindowFunctionToMap<T, R, D = any>({ windowFunction, dependencies }: setWindowEventProps<T, R, D>) {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    window[windowFunction.type] = async (windowData: D) => {
      const params = {
        map,
        ...dependencies,
        // @ts-ignores
        ...windowData,
      };
      console.log(`${windowFunction.type} called with data:`, params);
      const result = await windowFunction.handler(params as T & D & { map: Map });
      return result;
    };
  }, [map, windowFunction]);

  return <></>;
}
