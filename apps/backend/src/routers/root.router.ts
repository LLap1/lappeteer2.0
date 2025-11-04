import {
  createPlanet,
  findPlanet,
  listPlanets,
  updatePlanet,
} from "./planets/planets.router";

export const root = {
  planets: {
    list: listPlanets,
    create: createPlanet,
    find: findPlanet,
    update: updatePlanet,
  },
};
