import { OpenAPIGenerator } from '@orpc/openapi';
import { oz } from '@orpc/zod';
import { JSON_SCHEMA_REGISTRY, ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { root } from 'src/orpc/routers/root.router';
import packageJson from '../../package.json';
import { createDocumentInputExample } from './examples/create-document-input.example';
import { downloadTemplateExample } from './examples/download-template-input.example';
import { CreateDocumentsInputSchema } from 'src/orpc/routers/documents/documents.router.schema';
import {
  DownloadTemplateInputSchema,
  UploadTemplateInputSchema,
  UploadTemplateOutputSchema,
} from 'src/orpc/routers/templates/templates.router.schema';
import { ZipFileSchema } from 'src/models/file.model';
import { PowerpointTemplateSchema } from 'src/models/file.model';
const openapiGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export async function generateOpenAPIDocument() {
  const spec = await openapiGenerator.generate(root, {
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

  if (spec.paths && spec.paths['/templates/upload'] && spec.paths['/templates/upload'].post) {
    const uploadPath = spec.paths['/templates/upload'].post;
    uploadPath.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: 'PowerPoint template file (.pptx)',
              },
            },
            required: ['file'],
          },
        },
      },
    };
  }

  return spec;
}

JSON_SCHEMA_REGISTRY.add(CreateDocumentsInputSchema, {
  examples: [createDocumentInputExample],
});

JSON_SCHEMA_REGISTRY.add(DownloadTemplateInputSchema, {
  examples: [downloadTemplateExample],
});
