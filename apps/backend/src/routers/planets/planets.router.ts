import * as z from "zod";
import { PlanetSchema } from "src/models/planets.model";
import {
  NewPlanetSchema,
  UpdatePlanetSchema,
} from "src/routers/planets/planets.router.schema";
import { nest } from "src/main";
import { PlanetService } from "src/logic/planets/planets.service";
import { os } from "@orpc/server";

const ERROR_MAP = {
  NOT_FOUND: {
    message: "Planet not found",
  },
};

const base = os
  .errors(ERROR_MAP)
  .$context<{ headers: Record<string, string> }>();

export const listPlanets = base
  .route({
    method: "GET",
    path: "/planets",
    summary: "List all planets",
    tags: ["Planets"],
  })
  .output(z.array(PlanetSchema))
  .handler(async () => {
    return nest.get(PlanetService).list();
  });

export const createPlanet = base
  .route({
    method: "POST",
    path: "/planets",
    summary: "Create a planet",
    tags: ["Planets"],
  })
  .input(NewPlanetSchema)
  .output(PlanetSchema)
  .handler(async ({ input }) => {
    return nest.get(PlanetService).create(input);
  });

export const findPlanet = base
  .route({
    method: "GET",
    path: "/planets/{id}",
    summary: "Find a planet",
    tags: ["Planets"],
  })
  .input(PlanetSchema.pick({ id: true }))
  .output(PlanetSchema)
  .handler(async ({ input, errors }) => {
    const planet = nest.get(PlanetService).find(input.id);
    if (!planet) {
      throw errors.NOT_FOUND;
    }
    return planet;
  });

export const updatePlanet = base
  .route({
    method: "PUT",
    path: "/planets/{id}",
    summary: "Update a planet",
    tags: ["Planets"],
  })
  .errors(ERROR_MAP)
  .input(UpdatePlanetSchema)
  .output(PlanetSchema)
  .handler(async ({ input, errors }) => {
    const planet = nest.get(PlanetService).update(input);
    if (!planet) {
      throw errors.NOT_FOUND;
    }
    return planet;
  });
