import { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import type { PathOptions } from 'leaflet';

export namespace MapUtils {
  export async function addTileLayer({ url, map }: { url: string; map: LeafletMap }): Promise<void> {
    const tileLayer = L.tileLayer(url, { crossOrigin: 'anonymous' });
    tileLayer.addTo(map);
  }

  export async function removeLayers({ map }: { map: LeafletMap }): Promise<void> {
    map.eachLayer(function (layer: L.Layer) {
      layer.remove();
    });
  }

  export async function waitForTilelayersToLoad({ map }: { map: LeafletMap }): Promise<void> {
    const tileLayersLoadPromises: Promise<void>[] = [];
    map.eachLayer(function (layer: L.Layer) {
      if (layer instanceof L.TileLayer) {
        tileLayersLoadPromises.push(
          new Promise<void>(resolve => {
            if (!layer.isLoading()) {
              resolve();
            } else {
              layer.on('load', () => resolve());
            }
          }),
        );
      }
    });

    await Promise.all(tileLayersLoadPromises);
  }

  export async function exportMap({ map }: { map: LeafletMap }): Promise<string[]> {
    const mapContainer = map.getContainer()!;
    const tileLayers: L.TileLayer[] = [];
    const vectorLayers: L.GeoJSON[] = [];

    map.eachLayer(function (layer: L.Layer) {
      if (layer instanceof L.TileLayer) {
        tileLayers.push(layer);
      } else if (layer instanceof L.GeoJSON) {
        vectorLayers.push(layer);
      }
    });

    const mapRect = mapContainer.getBoundingClientRect();
    const layerExports: Array<string> = [];

    for (let i = 0; i < tileLayers.length; i++) {
      const tileLayer = tileLayers[i];
      const tileContainer = tileLayer.getContainer()!;
      const tileImages = Array.from(tileContainer.getElementsByTagName('img')) as HTMLImageElement[];

      const canvas = document.createElement('canvas');
      canvas.width = mapContainer.clientWidth;
      canvas.height = mapContainer.clientHeight;
      const ctx = canvas.getContext('2d')!;

      const tilePromises = tileImages.map(function (tileImg) {
        return new Promise<{ img: HTMLImageElement; rect: DOMRect }>(resolve => {
          const tileRect = tileImg.getBoundingClientRect();
          const relativeX = tileRect.left - mapRect.left;
          const relativeY = tileRect.top - mapRect.top;

          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = function () {
            resolve({
              img,
              rect: new DOMRect(relativeX, relativeY, tileRect.width, tileRect.height),
            });
          };

          img.onerror = function () {
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

      loadedTileImages.forEach(function ({ img, rect }) {
        ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
      });

      layerExports.push(canvas.toDataURL('image/png', 1.0));
    }

    for (let i = 0; i < vectorLayers.length; i++) {
      const overlayPane = map.getPanes()?.overlayPane;
      const overlayCanvas = overlayPane?.querySelector('canvas');

      if (overlayCanvas) {
        const canvas = document.createElement('canvas');
        const ctx = overlayCanvas.getContext('2d')!;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(overlayCanvas);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        await new Promise<void>(resolve => {
          const svgImage = new Image();

          svgImage.onload = function () {
            ctx.drawImage(svgImage, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(svgUrl);
            resolve();
          };

          svgImage.onerror = function () {
            URL.revokeObjectURL(svgUrl);
            console.error(new Error('Failed to render GeoJSON overlay'));
            resolve();
          };

          svgImage.src = svgUrl;
        }).catch(error => {
          console.error('Failed to render GeoJSON overlay:', error);
        });

        layerExports.push(canvas.toDataURL('image/png', 1.0));
      }
    }

    return layerExports;
  }

  export async function setView({
    map,
    center,
    zoom,
  }: {
    map: LeafletMap;
    center: [number, number];
    zoom: number;
  }): Promise<void> {
    map.setView(center, zoom);
  }

  export async function addGeoJsonLayer({
    map,
    geojson,
  }: {
    map: LeafletMap;
    geojson: Feature<Geometry, { style: PathOptions }>;
  }): Promise<void> {
    const geoJsonLayer = L.geoJSON(geojson);
    geoJsonLayer.addTo(map);
  }
}
