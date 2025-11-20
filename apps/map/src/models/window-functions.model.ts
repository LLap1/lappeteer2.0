import { type Geometry, type Feature, type GeoJsonObject } from 'geojson';
import * as L from 'leaflet';
import type { PathOptions } from 'leaflet';

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

export const addGeoJsonLayer: WindowFunction<
  {
    map: L.Map;
    geojson: Feature<Geometry, { style: PathOptions }>;
    style: L.PathOptions;
  },
  void
> = {
  type: 'addGeoJsonLayer',
  handler: ({ map, geojson }) =>
    new Promise<void>(resolve => {
      const geoJsonLayer = L.geoJSON(geojson.geometry as GeoJsonObject, { style: geojson.properties?.style });
      geoJsonLayer.addTo(map);
      resolve();
    }),
};

export const removeLayers: WindowFunction<{ map: L.Map }, void> = {
  type: 'removeLayers',
  handler: async ({ map }) => {
    return new Promise<void>(resolve => {
      map.eachLayer(layer => {
        layer.remove();
      });
      resolve();
    });
  },
};

export const wait: WindowFunction<{ seconds: number }, void> = {
  type: 'wait',
  handler: async ({ seconds }) => {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
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
    const vectorLayers: L.GeoJSON[] = [];
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        tileLayers.push(layer);
      } else if (layer instanceof L.GeoJSON) {
        vectorLayers.push(layer);
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

    const tilePromises = tileImages.map(tileImg => {
      return new Promise<{ img: HTMLImageElement; rect: DOMRect }>((resolve, _) => {
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
          console.error(new Error(`Failed to load image: ${tileImg.src}`));
          resolve({
            img: new Image(),
            rect: new DOMRect(0, 0, 0, 0),
          });
        };
        img.src = tileImg.src;
      });
    });

    const loadedTileImages = await Promise.all(tilePromises);
    loadedTileImages.forEach(({ img, rect }) => {
      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    });

    const overlayPane = map.getPanes()?.overlayPane;
    const overlaySvg = overlayPane?.querySelector('svg');
    if (overlaySvg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(overlaySvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, _) => {
        const svgImage = new Image();
        svgImage.onload = () => {
          ctx.drawImage(svgImage, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        svgImage.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          console.error(new Error('Failed to render GeoJSON overlay'));
          resolve();
        };
        svgImage.src = svgUrl;
      }).catch(error => {
        console.error('Failed to render GeoJSON overlay:', error);
      });
    }

    const dataURL = canvas.toDataURL('image/png', 1.0);
    return dataURL;
  },
};
