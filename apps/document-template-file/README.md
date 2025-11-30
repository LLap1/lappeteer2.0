# Document Template File Service

Service for generating PowerPoint documents from templates and extracting placeholder parameters.

## Purpose

- Generates PowerPoint documents (.pptx) by filling template placeholders with provided data
- Extracts placeholder parameters (keys, types, dimensions) from PowerPoint templates

## Port

Default: 3002 (configurable via `PORT` environment variable)

## API Routes

- `POST /generate` - Generate a PowerPoint document from a template
- `POST /extract-params` - Extract placeholder parameters from a template

## Dependencies

- `document-template-crud` - For downloading template files
- Python 3 - For PowerPoint processing scripts

## Environment Variables

```env
PORT=3002
TEMPLATE_CRUD_URL=http://localhost:3001
```

## Development

```bash
pnpm --filter @auto-document/document-template-file dev
```

## API Documentation

- Swagger UI: http://localhost:3002/docs
- OpenAPI Spec: http://localhost:3002/openapi-spec.json

## Python Scripts

The service uses Python scripts for PowerPoint manipulation:

- `src/logic/template-file/template-generator/generate.py` - Generates documents
- `src/logic/template-file/template-parser/parse.py` - Extracts placeholders
