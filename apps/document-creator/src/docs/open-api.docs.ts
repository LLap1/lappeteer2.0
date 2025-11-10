import { OpenAPIGenerator } from '@orpc/openapi';
import { oz } from '@orpc/zod';
import { JSON_SCHEMA_REGISTRY, ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { root } from 'src/orpc/routers/root.router';
import packageJson from '../../package.json';
import {
  createDocumentInputExample,
  createDocumentInputMinimalExample,
  createDocumentInputWithGeoJsonExample,
} from './examples/create-document-input.example';
import { downloadTemplateExample } from './examples/download-template-input.example';
import { CreateDocumentsInputSchema } from 'src/orpc/routers/documents/documents.router.schema';
import { DownloadTemplateInputSchema } from 'src/orpc/routers/templates/templates.router.schema';
import { ZipFileSchema } from 'src/models/file.model';
import { PowerpointTemplateSchema } from 'src/models/file.model';
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
      ZipFile: {
        schema: ZipFileSchema,
      },
      PowerpointFile: {
        schema: PowerpointTemplateSchema,
      },
    },
    servers: [{ url: '/api' }],
  });
}

JSON_SCHEMA_REGISTRY.add(CreateDocumentsInputSchema, {
  examples: [createDocumentInputExample, createDocumentInputMinimalExample, createDocumentInputWithGeoJsonExample],
});

JSON_SCHEMA_REGISTRY.add(DownloadTemplateInputSchema, {
  examples: [downloadTemplateExample],
});
