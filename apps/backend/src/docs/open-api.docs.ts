import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { root } from 'src/routers/root.router';
import { PlanetSchema } from 'src/models/planets.model';
import packageJson from '../../package.json';
import { NewPlanetSchema, UpdatePlanetSchema } from 'src/routers/planets/planets.router.schema';

const openapiGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export async function generateOpenAPIDocument() {
  return openapiGenerator.generate(root, {
    info: {
      title: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    },
    commonSchemas: {
      NewPlanet: { schema: NewPlanetSchema },
      UpdatePlanet: { schema: UpdatePlanetSchema },
      Planet: { schema: PlanetSchema },
    },
    servers: [{ url: '/api' }],
  });
}
