import type { Dispatch } from 'react';
import { MapUtils } from '../models/map.utils.js';
import type { Router } from '../models/router.model.js';
import type { MapPoolAction, MapPoolObject, MapPoolState } from '../reducers/map-pool.reducer.js';
import type { Feature, Geometry } from 'geojson';
import type { PathOptions, WMSOptions } from 'leaflet';

export type MapRouterActions =
  | {
      type: 'addTileLayer';
      params: { id: string; url: string };
    }
  | {
      type: 'removeMap';
      params: { id: string };
    }
  | {
      type: 'rotateMap';
      params: { id: string; rotation: number };
    }
  | {
      type: 'waitForTilelayersToLoad';
      params: { id: string };
    }
  | {
      type: 'removeLayers';
      params: { id: string };
    }
  | {
      type: 'addWmsLayer';
      params: { id: string; wmsUrl: string; options: WMSOptions };
    }
  | {
      type: 'hidePane';
      params: { id: string; pane: string };
    }
  | {
      type: 'revealPane';
      params: { id: string; pane: string };
    }
  | {
      type: 'setView';
      params: { id: string; bounds: [number, number, number, number] };
    }
  | {
      type: 'removeGeoJsonLayer';
      params: { id: string };
    }
  | {
      type: 'addGeoJsonLayer';
      params: { id: string; geojson: Feature<Geometry, { style: PathOptions; text?: string }> };
    }
  | {
      type: 'createMapPool';
      params: Omit<MapPoolObject, 'map'>[];
    };

type MapRouterDependencies = { maps: MapPoolState; dispatch: Dispatch<MapPoolAction> };

export const mapRouter: Router<MapRouterActions, MapRouterDependencies> = {
  hidePane: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.hidePane({ map, pane: params.pane });
  },
  revealPane: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.revealPane({ map, pane: params.pane });
  },
  addTileLayer: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.addTileLayer({ map, url: params.url });
  },
  addWmsLayer: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.addWmsLayer({ map, wmsUrl: params.wmsUrl, options: params.options });
  },
  waitForTilelayersToLoad: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.waitForTilelayersToLoad({ map });
  },
  removeLayers: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.removeLayers({ map });
  },
  setView: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }

    return MapUtils.setView({ map, bounds: params.bounds });
  },
  rotateMap: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.rotateMap({ map, rotation: params.rotation });
  },

  removeGeoJsonLayer: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.removeGeoJsonLayer({ map });
  },
  addGeoJsonLayer: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    return MapUtils.addGeoJsonLayer({ map, geojson: params.geojson });
  },
  createMapPool: async (params, dependencies) => {
    dependencies.dispatch({ type: 'create', params: params.map(param => ({ ...param, map: null })) });
    await new Promise(resolve => setTimeout(resolve, 1000)); // wainting for maps to be created
  },
  removeMap: async (params, dependencies) => {
    const map = dependencies.maps.find(map => map.id === params.id)?.map;
    if (!map) {
      throw new Error(`Map with id ${params.id} not found`);
    }
    map.remove();
    return dependencies.dispatch({ type: 'remove', params: [params.id] });
  },
} as const;
