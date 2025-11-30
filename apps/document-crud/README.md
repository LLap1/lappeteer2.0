# Document Template CRUD Service

Service for managing template metadata and file operations. Handles CRUD operations for templates stored in MongoDB and template files stored in S3.

## Purpose

Manages template metadata (name, placeholders, etc.) and provides file download capabilities for template files.

## Port

Default: 3001 (configurable via `PORT` environment variable)

## API Routes

### Template Metadata

- `POST /templates` - Create a new template with metadata
- `GET /templates/:id` - Get template metadata by ID
- `GET /templates` - List all templates
- `PUT /templates/:id` - Update template metadata
- `DELETE /templates/:id` - Delete a template

### Template Files

- `GET /templates/:id/download` - Download template file

## Dependencies

- MongoDB - For template metadata storage
- S3-compatible storage - For template file storage

## Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/documents
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=region
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=bucket-name
```

## Development

```bash
pnpm --filter @auto-document/document-template-crud dev
```

## API Documentation

- Swagger UI: http://localhost:3001/docs
- OpenAPI Spec: http://localhost:3001/openapi-spec.json
