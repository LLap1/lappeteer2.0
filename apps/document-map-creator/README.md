# Document Creator Service

Main orchestration service for automated document generation. Coordinates template fetching, parameter transformation, and document generation.

## Purpose

Receives document creation requests, fetches template metadata, transforms input data with template placeholders, and generates multiple PowerPoint documents.

## Port

Default: 3000 (configurable via `PORT` environment variable)

## API Routes

- `POST /documents/create` - Create documents from a template with provided data

## Dependencies

- `document-template-crud` - For fetching template metadata
- `document-template-file` - For generating documents from templates
- `document-map-pool` - For generating map images

## Environment Variables

```env
PORT=3000
TEMPLATE_FILE_URL=http://localhost:3002
TEMPLATE_CRUD_URL=http://localhost:3001
MAP_POOL_URL=http://localhost:8080
PUPPETEER_TIMEOUT=600000
PUPPETEER_CONCURRENCY=2
PUPPETEER_MAX_CONCURRENCY=20
PUPPETEER_HEADLESS=true
PUPPETEER_DEVTOOLS=false
```

## Development

```bash
pnpm --filter @auto-document/document-map-creator dev
```

## API Documentation

- Swagger UI: http://localhost:3000/docs
- OpenAPI Spec: http://localhost:3000/openapi-spec.json
