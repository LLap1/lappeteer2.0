import { geoJSON, Map as LeafletMap, tileLayer, TileLayer, CRS, type WMSOptions } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { Layer, type PathOptions } from 'leaflet';
import 'leaflet-rotate';

export namespace MapUtils {
  export async function addWmsLayer({
    map,
    wmsUrl,
    options,
  }: {
    map: LeafletMap;
    wmsUrl: string;
    options?: WMSOptions;
  }): Promise<void> {
    const layer = tileLayer.wms(wmsUrl, { crossOrigin: true, crs: CRS.EPSG4326, ...options });
    const waitForLayerToLoad = new Promise<void>(async resolve => {
      layer.on('load', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        resolve();
      });
    });
    layer.addTo(map);
    await waitForLayerToLoad;
  }

  export async function hidePane({ map, pane }: { map: LeafletMap; pane: string }): Promise<void> {
    const paneElement = map.getPane(pane);
    if (!paneElement) {
      throw new Error(`Pane ${pane} not found`);
    }
    paneElement.style.display = 'none';
  }

  export async function revealPane({ map, pane }: { map: LeafletMap; pane: string }): Promise<void> {
    const paneElement = map.getPane(pane);
    if (!paneElement) {
      throw new Error(`Pane ${pane} not found`);
    }
    paneElement.style.display = 'block';
  }

  export async function rotateMap({ map, rotation }: { map: LeafletMap; rotation: number }): Promise<void> {
    return new Promise<void>(resolve => {
      const originalBearing = map.getBearing();
      const id = setInterval(() => {
        if (map.getBearing() !== originalBearing) {
          clearInterval(id);
          resolve();
        }
      }, 1000);
      map.setBearing(rotation);
    });
  }

  export async function addTileLayer({ url, map }: { url: string; map: LeafletMap }): Promise<void> {
    const layer = tileLayer(url, { crossOrigin: 'anonymous' });
    const waitForLayerToLoad = new Promise<void>(async resolve => {
      layer.on('load', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        resolve();
      });
    });
    layer.addTo(map);
    await waitForLayerToLoad;
  }

  export async function removeLayers({ map }: { map: LeafletMap }): Promise<void> {
    map.eachLayer(function (layer: Layer) {
      layer.remove();
    });
  }

  export async function waitForTilelayersToLoad({ map }: { map: LeafletMap }): Promise<void> {
    const tileLayersLoadPromises: Promise<void>[] = [];
    map.eachLayer(function (layer: Layer) {
      if (layer instanceof TileLayer) {
        tileLayersLoadPromises.push(
          new Promise<void>(async resolve => {
            if (!layer.isLoading()) {
              await new Promise(resolve => setTimeout(resolve, 500));
              resolve();
            } else {
              layer.on('load', async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                resolve();
              });
            }
          }),
        );
      }
    });

    await Promise.all(tileLayersLoadPromises);
  }

  export async function setView({
    map,
    bounds,
  }: {
    map: LeafletMap;
    bounds: [number, number, number, number];
  }): Promise<void> {
    map.fitBounds([
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ]);
  }

  export async function addGeoJsonLayer({
    map,
    geojson,
  }: {
    map: LeafletMap;
    geojson: Feature<Geometry, { style: PathOptions }>;
  }): Promise<void> {
    const geoJsonLayer = geoJSON(geojson);
    geoJsonLayer.addTo(map);
  }

  export async function removeGeoJsonLayer({ map }: { map: LeafletMap }): Promise<void> {
    map.eachLayer(function (layer: Layer) {
      if (!(layer instanceof TileLayer)) {
        layer.remove();
      }
    });
  }
}
