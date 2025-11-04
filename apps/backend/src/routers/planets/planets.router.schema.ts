import { z } from 'zod';
import { UserSchema } from 'src/models/user.model';
import { PlanetSchema } from 'src/models/planets.model';

export const PlanetListSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .transform(val => Number(val)),
});

export const NewPlanetSchema = z.object({
  name: PlanetSchema.shape.name,
  description: PlanetSchema.shape.description,
  creator: UserSchema,
  image: z.file().mime(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']).optional(),
});

export const UpdatePlanetSchema = z.object({
  id: PlanetSchema.shape.id,
  name: PlanetSchema.shape.name,
  description: PlanetSchema.shape.description,
  image: z.file().mime(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']).optional(),
});

export type NewPlanet = z.infer<typeof NewPlanetSchema>;
export type UpdatePlanet = z.infer<typeof UpdatePlanetSchema>;
export type PlanetList = z.infer<typeof PlanetListSchema>;
