import { type Feature, type MultiPolygon, type Polygon } from 'geojson';
import L from 'leaflet';

export type WindowFunction<T, R> = {
  type: string;
  handler: WindowHandleFunction<T, R>;
};

export type WindowHandleFunction<T, R> = (data: T) => Promise<R>;

export const addTileLayer: WindowFunction<{ map: L.Map; id: string; url: string }, void> = {
  type: 'addTileLayer',
  handler: ({ map, url, id }) =>
    new Promise<void>(resolve => {
      const tileLayer = L.tileLayer(url, { id, crossOrigin: 'anonymous' });
      tileLayer.addTo(map);
      resolve();
    }),
};

export const setView: WindowFunction<{ map: L.Map; center: [number, number]; zoom?: number }, void> = {
  type: 'setView',
  handler: ({ map, center, zoom }) =>
    new Promise<void>(resolve => {
      map.setView(center, zoom);
      resolve();
    }),
};

export const addGeoJsonLayer: WindowFunction<{ map: L.Map; geojson: Feature<Polygon> }, void> = {
  type: 'addGeoJsonLayer',
  handler: ({ map, geojson }) =>
    new Promise<void>(resolve => {
      const geoJsonLayer = L.geoJSON(geojson, { style: { color: 'red', fillColor: 'red', fillOpacity: 0.5 } });
      geoJsonLayer.addTo(map);
      resolve();
    }),
};

export const setMapSize: WindowFunction<
  { map: L.Map; width: number; height: number; setWidth: (width: number) => void; setHeight: (height: number) => void },
  void
> = {
  type: 'setMapSize',
  handler: async ({ map, width, height, setWidth, setHeight }) => {
    return new Promise<void>(resolve => {
      setWidth(width);
      setHeight(height);
      setTimeout(() => map.invalidateSize(), 0);
      resolve();
    });
  },
};

export const waitForTilelayersToLoad: WindowFunction<{ map: L.Map }, void> = {
  type: 'waitForTilelayersToLoad',
  handler: async ({ map }) => {
    const tileLayersLoadPromises: Promise<void>[] = [];

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        tileLayersLoadPromises.push(
          new Promise<void>(resolve => {
            if (!layer.isLoading()) {
              resolve();
            } else {
              layer.on('load', () => {
                resolve();
              });
            }
          }),
        );
      }
    });
    await Promise.all(tileLayersLoadPromises);
  },
};

export const exportMap: WindowFunction<{ map: L.Map }, string> = {
  type: 'exportMap',
  handler: async ({ map }) => {
    const mapContainer = map.getContainer()!;
    const tileLayers: L.TileLayer[] = [];
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        tileLayers.push(layer);
      }
    });

    const tileImages = tileLayers.flatMap(tileLayer => {
      const tileContainer = tileLayer.getContainer()!;
      return Array.from(tileContainer.getElementsByTagName('img')) as HTMLImageElement[];
    });

    const canvas = document.createElement('canvas');
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;
    const ctx = canvas.getContext('2d')!;

    const mapRect = mapContainer.getBoundingClientRect();

    const imagePromises = tileImages.map(tileImg => {
      return new Promise<{ img: HTMLImageElement; rect: DOMRect }>((resolve, reject) => {
        const tileRect = tileImg.getBoundingClientRect();
        const relativeX = tileRect.left - mapRect.left;
        const relativeY = tileRect.top - mapRect.top;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          resolve({
            img,
            rect: new DOMRect(relativeX, relativeY, tileRect.width, tileRect.height),
          });
        };
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${tileImg.src}`));
        };
        img.src = tileImg.src;
      });
    });

    const loadedImages = await Promise.all(imagePromises);
    loadedImages.forEach(({ img, rect }) => {
      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    });
    const dataURL = canvas.toDataURL('image/png', 1.0);
    return dataURL;
  },
};
