import type { MapRouterActions } from './map.router';

export type WindowActions = MapRouterActions;
export type WindowAction<T extends WindowActions['type'] = WindowActions['type']> = Extract<WindowActions, { type: T }>;
