import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { root } from 'src/routers/root.router';
import packageJson from '../../package.json';

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
    commonSchemas: {},
    servers: [{ url: '/api' }],
  });
}
