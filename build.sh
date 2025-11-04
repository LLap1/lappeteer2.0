#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting full build process with Turborepo..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf apps/web/dist
rm -rf apps/api/dist
rm -rf apps/api/public
rm -rf dist

# Use Turborepo to build everything in parallel with proper dependency management
echo "🏗️  Building all packages with Turborepo..."
pnpm i
pnpm run build

# Create root dist directory structure
echo "📦 Creating deployable build at /dist..."
mkdir -p dist/public

# Copy server build to root /dist
echo "📋 Copying server build to /dist..."
cp -r apps/api/dist/* dist/

# Copy frontend build to root /dist/public
echo "📋 Copying frontend build to /dist/public..."
if [ -d "apps/web/dist" ]; then
    cp -r apps/web/dist/* dist/public/
else
    echo "⚠️ Frontend build not found at apps/web/dist/"
    exit 1
fi

# Copy .env file from server to /dist if it exists
if [ -f "apps/api/.env" ]; then
    echo "📋 Copying .env to /dist..."
    cp apps/api/.env dist/
else
    echo "⚠️ No .env file found in apps/api/"
fi

# Create production package.json with only runtime dependencies from apps/api
echo "📋 Creating production package.json..."
cd ./dist/
node -e "
const fs = require('fs');
const path = require('path');

// Read the API package.json
const apiPackageJson = JSON.parse(fs.readFileSync('../apps/api/package.json', 'utf8'));

// Create production package.json with only dependencies (no devDependencies)
const productionPackage = {
  name: 'overlays-api-production',
  version: '1.0.0',
  type: 'module',
  engines: {
    node: '>=20'
  },
  dependencies: apiPackageJson.dependencies || {}
};

// Write the production package.json
fs.writeFileSync('package.json', JSON.stringify(productionPackage, null, 2));
console.log('✅ Production package.json created with', Object.keys(productionPackage.dependencies).length, 'dependencies');
"

# Install production dependencies
echo "📋 Installing production dependencies..."
pnpm install --prod --ignore-workspace

echo "✅ Build completed successfully!"
echo "📦 Frontend built with Vite → /dist/public/"
echo "📦 Backend built with esbuild → /dist/"
echo "📦 Production dependencies installed → /dist/node_modules/"
echo "📦 Environment file copied → /dist/.env"
echo ""
echo "To deploy:"
echo "1. Copy /dist folder to your server"
echo "2. PORT=3000 node index.js (dependencies already installed!)" 