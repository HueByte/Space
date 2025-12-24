#!/bin/bash

# Space Blog - Build Script
set -e

echo "Building Space Blog..."

# Build client
echo "Building client..."
cd src/Client
npm install
npm run build
cd ../..

# Build API
echo "Building API..."
cd src/Api/Space.Api
dotnet build -c Release
cd ../../..

echo "Build complete!"
