import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { JSON_SCHEMA_REGISTRY, ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import type { AnyContractRouter } from '@orpc/contract';

type SchemaObject = {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject | { $ref: string }>;
  items?: SchemaObject | { $ref: string };
  description?: string;
  $ref?: string;
};

type RequestBodyObject = {
  content: Record<string, { schema?: SchemaObject | { $ref: string }; examples?: any }>;
  required?: boolean;
  $ref?: string;
};

function findFileFieldsInSchema(schema: SchemaObject | { $ref: string }, prefix = ''): string[] {
  const fileFields: string[] = [];

  if ('$ref' in schema) {
    return fileFields;
  }

  if (schema.format === 'binary' || (schema.type === 'string' && schema.format === 'binary')) {
    if (prefix) {
      fileFields.push(prefix);
    }
    return fileFields;
  }

  if (schema.type === 'object' && schema.properties) {
    for (const key in schema.properties) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const fieldSchema = schema.properties[key];
      if (!('$ref' in fieldSchema)) {
        fileFields.push(...findFileFieldsInSchema(fieldSchema, fieldPath));
      }
    }
  } else if (schema.type === 'array' && schema.items) {
    if (!('$ref' in schema.items)) {
      fileFields.push(...findFileFieldsInSchema(schema.items, prefix ? `${prefix}[]` : '[]'));
    }
  }

  return fileFields;
}

function hasFileFields(requestBody: RequestBodyObject | { $ref: string } | undefined): boolean {
  if (!requestBody || '$ref' in requestBody) {
    return false;
  }

  for (const contentType in requestBody.content) {
    const mediaType = requestBody.content[contentType];
    if (mediaType.schema && !('$ref' in mediaType.schema)) {
      const fileFields = findFileFieldsInSchema(mediaType.schema);
      if (fileFields.length > 0) {
        return true;
      }
    }
  }

  return false;
}

function extractFileFieldsFromRequestBody(requestBody: RequestBodyObject | { $ref: string } | undefined): {
  fileFields: Record<string, SchemaObject>;
  examples?: any;
} {
  const fileFields: Record<string, SchemaObject> = {};
  let examples: any = undefined;

  if (!requestBody || '$ref' in requestBody) {
    return { fileFields };
  }

  for (const contentType in requestBody.content) {
    const mediaType = requestBody.content[contentType];
    if (mediaType.schema && !('$ref' in mediaType.schema)) {
      const schema = mediaType.schema;
      if (schema.type === 'object' && schema.properties) {
        for (const key in schema.properties) {
          const fieldSchema = schema.properties[key];
          if (!('$ref' in fieldSchema)) {
            if (fieldSchema.format === 'binary' || (fieldSchema.type === 'string' && fieldSchema.format === 'binary')) {
              fileFields[key] = {
                type: 'string',
                format: 'binary',
                description: fieldSchema.description || 'File upload',
              };
            }
          }
        }
      }
      if ((schema as any).examples) {
        examples = (schema as any).examples;
      }
    }
    if ((mediaType as any).examples) {
      examples = (mediaType as any).examples;
    }
  }

  return { fileFields, examples };
}

export async function generateOpenAPIDocument(router: AnyContractRouter, options: OpenAPIGeneratorGenerateOptions) {
  const openapiGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const spec = await openapiGenerator.generate(router, options);

  // if (!spec.paths) {
  //   return spec;
  // }

  // for (const path in spec.paths) {
  //   const pathItem = spec.paths[path];
  //   if (!pathItem) continue;

  //   const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
  //   for (const method of methods) {
  //     const operation = pathItem[method];
  //     if (!operation || !operation.requestBody) continue;

  //     if (hasFileFields(operation.requestBody as RequestBodyObject | { $ref: string } | undefined)) {
  //       const originalRequestBody = operation.requestBody as RequestBodyObject | { $ref: string } | undefined;
  //       const { fileFields, examples } = extractFileFieldsFromRequestBody(originalRequestBody);
  //       const required = Object.keys(fileFields);

  //       let schemaExamples: any = undefined;

  //       if (originalRequestBody && !('$ref' in originalRequestBody)) {
  //         for (const contentType in originalRequestBody.content) {
  //           const mediaType = originalRequestBody.content[contentType];
  //           if ((mediaType as any).examples) {
  //             schemaExamples = (mediaType as any).examples;
  //             break;
  //           }
  //           if (mediaType.schema && !('$ref' in mediaType.schema)) {
  //             const schema = mediaType.schema as any;
  //             if (schema.examples) {
  //               schemaExamples = schema.examples;
  //               break;
  //             }
  //             if (schema['x-examples']) {
  //               schemaExamples = schema['x-examples'];
  //               break;
  //             }
  //           }
  //         }
  //       }

  //       const multipartSchema: any = {
  //         type: 'object',
  //         properties: fileFields,
  //         ...(required.length > 0 && { required }),
  //       };

  //       if (examples || schemaExamples) {
  //         multipartSchema.examples = examples || schemaExamples;
  //       }

  //       const multipartContent: any = {
  //         schema: multipartSchema,
  //       };

  //       if (examples || schemaExamples) {
  //         multipartContent.examples = examples || schemaExamples;
  //       }

  //       (operation.requestBody as any) = {
  //         required: true,
  //         content: {
  //           'multipart/form-data': multipartContent,
  //         },
  //       };
  //     }
  //   }
  // }

  return spec;
}
