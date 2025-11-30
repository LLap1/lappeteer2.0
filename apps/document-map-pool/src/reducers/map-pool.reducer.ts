import type { Map } from 'leaflet';

export type MapPoolAction =
  | {
      type: 'add';
      params: MapPoolObject[];
    }
  | {
      type: 'remove';
      params: string[];
    }
  | {
      type: 'create';
      params: MapPoolObject[];
    }
  | {
      type: 'update';
      params: Partial<MapPoolObject>;
    };

export type MapPoolObject = {
  id: string;
  map: Map | null;
  width: number;
  height: number;
};

export type MapPoolState = MapPoolObject[];

type MapPoolReducer = {
  [K in MapPoolAction['type']]: (
    params: Extract<MapPoolAction, { type: K }>['params'],
    state: MapPoolState,
  ) => MapPoolState;
};

export const mapPoolReducer: MapPoolReducer = {
  add: function (params, state): MapPoolState {
    return [...state, ...params];
  },
  remove: function (params, state): MapPoolState {
    const idsToRemove = new Set(params);
    return [...state.filter(obj => !idsToRemove.has(obj.id))];
  },
  create: function (params, state): MapPoolState {
    return [...state, ...params];
  },
  update: function (params, state): MapPoolState {
    return [...state.map(obj => (obj.id === params.id ? { ...obj, ...params } : obj))];
  },
};

export const createMapPoolReducer = (state: MapPoolState, action: MapPoolAction) => {
  return mapPoolReducer[action.type](action.params as never, state);
};
