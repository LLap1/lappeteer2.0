import { OpenAPIGenerator } from '@orpc/openapi';
import { JSON_SCHEMA_REGISTRY, ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { root } from 'src/routers/root.router';
import packageJson from '../../package.json';
import {
  createDocumentInputExample,
  createDocumentInputMinimalExample,
  createDocumentInputWithDefaultFilenamesExample,
} from './examples';
import { CreateDocumentInputSchema } from 'src/routers/documents/documents.router.schema';

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
    examples: {
      CreateDocumentInput: {
        'With Custom Filenames': {
          value: createDocumentInputExample,
          summary: 'Create documents with custom filenames',
        },
        'Minimal Example': {
          value: createDocumentInputMinimalExample,
          summary: 'Create a single document with default filename',
        },
        'Multiple With Default Names': {
          value: createDocumentInputWithDefaultFilenamesExample,
          summary: 'Create multiple documents with auto-generated filenames',
        },
      },
    },
  });
}

JSON_SCHEMA_REGISTRY.add(CreateDocumentInputSchema, {
  examples: [
    createDocumentInputExample,
    createDocumentInputMinimalExample,
    createDocumentInputWithDefaultFilenamesExample,
  ],
});
