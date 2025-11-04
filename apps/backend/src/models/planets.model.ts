import * as z from "zod";
import { UserSchema } from "./user.model";

export type Planet = z.infer<typeof PlanetSchema>;

export const PlanetSchema = z.object({
  id: z.coerce.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.url().optional(),
  creator: UserSchema,
});
