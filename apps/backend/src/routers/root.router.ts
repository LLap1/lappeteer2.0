import { createPlanet, findPlanet, listPlanets, updatePlanet } from './planets/planets.router';
import { healthcheck } from './healthcheck/healthcheck.router';

export const root = {
  healthcheck,
  planets: {
    list: listPlanets,
    create: createPlanet,
    find: findPlanet,
    update: updatePlanet,
  },
};
