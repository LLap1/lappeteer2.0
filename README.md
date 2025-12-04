# Auto Document - Document Generation Platform

A monorepo for an automated document generation system built with microservices architecture, using oRPC for type-safe inter-service communication.

## Tech Stack

- **Runtime**: Bun
- **Backend Framework**: NestJS
- **RPC Framework**: oRPC (OpenRPC)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: MongoDB (via Mongoose)
- **Storage**: S3-compatible storage
- **Document Processing**: Python scripts for PowerPoint manipulation

## Requirements

- Bun 1.3.2+
- pnpm 9+
- Python 3+ (for document processing)
- MongoDB (for template metadata)
- S3-compatible storage (for template files)

## Installation

```bash
pnpm install
```

## Development

Run all services with Turbo:

```bash
pnpm dev
```

Or run services individually:

```bash
# Document Creator (port 3000)
pnpm --filter @auto-document/document-map-creator dev

# Document Template CRUD (port 3001)
pnpm --filter @auto-document/document-template-crud dev

# Document Template File (port 3002)
pnpm --filter @auto-document/document-template-file dev
```

## Project Structure

### Apps

#### `apps/document-creator`

Main orchestration service that coordinates document creation.

- **Port**: 3000 (default)
- **Purpose**: Receives document creation requests, fetches template metadata, transforms parameters, and generates multiple documents
- **Dependencies**: `document-template-file`, `document-template-crud`
- **Routes**: `/documents/create`

#### `apps/document-template-crud`

Service for managing template metadata and file operations.

- **Port**: 3001 (default)
- **Purpose**: CRUD operations for template metadata (stored in MongoDB) and template file downloads (from S3)
- **Routes**:
  - `/templates` - Template metadata operations (create, get, list, update, delete)
  - `/templates/:id/download` - Download template files

#### `apps/document-template-file`

Service for document generation and parameter extraction.

- **Port**: 3002 (default)
- **Purpose**: Generates PowerPoint documents from templates and extracts placeholder parameters
- **Routes**:
  - `/generate` - Generate documents from templates
  - `/extract-params` - Extract placeholder parameters from templates

#### `apps/document-map-pool`

Frontend application for managing map pools (used for map placeholders in documents).

### Packages

#### `packages/orpc`

Shared oRPC utilities:

- `clients/rpc` - RPC client creation
- `handlers/*` - Request handlers for oRPC

#### `packages/nest`

Shared NestJS modules and services:

- `orpc-client` - oRPC client service for dependency injection
- `s3` - S3 file storage service
- `process` - Process execution service
- `root` - Root module configuration

#### `packages/server`

Server utilities for running NestJS apps with Hono and Bun.

## Architecture

### Service Communication

Services communicate via oRPC clients:

- Each service creates typed clients for other services it depends on
- Clients are merged and injected via `OrpcClientService` in NestJS
- Type safety is maintained through contract exports

### Document Generation Flow

1. **Client** → `document-creator`: Request document creation with template ID and data
2. **document-creator** → `document-template-crud`: Fetch template metadata (placeholders)
3. **document-creator**: Transform input data with template placeholders
4. **document-creator** → `document-template-file`: Generate documents for each data set
5. **document-template-file** → `document-template-crud`: Download template file
6. **document-template-file**: Process template with Python scripts
7. **document-creator**: Zip all generated documents and return

### Template Structure

Templates are PowerPoint files (.pptx) with placeholders that can be:

- **Text**: Simple text replacement
- **Image**: Image URL replacement
- **Map**: Map generation with GeoJSON data

Each template has metadata stored in MongoDB:

- Template ID
- Name
- File path (S3)
- Placeholders array (key, type, width, height)

## Environment Variables

### document-creator

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

### document-template-crud

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/documents
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=region
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=bucket-name
```

### document-template-file

```env
PORT=3002
TEMPLATE_CRUD_URL=http://localhost:3001
```

## API Documentation

Each service exposes OpenAPI documentation at `/docs` (Scalar UI) and OpenAPI spec at `/openapi-spec.json`.

## Build

```bash
pnpm build
```

## Scripts

- `pnpm dev` - Run all services in development mode
- `pnpm build` - Build all services
- `pnpm debug` - Run services with debugger attached

## Type Safety

The project uses TypeScript with strict type checking. oRPC contracts ensure type safety across service boundaries:

- Each service exports its contract from `contract.ts`
- Clients are created with contract types: `createRpcClient<typeof contract>(url)`
- Services inject typed clients via `OrpcClientService<RootClient>`

## License

Private
