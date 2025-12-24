#!/bin/bash

# Space Blog - Docker Build Script
set -e

echo "Building Space Blog Docker containers..."

# Build client and copy dist
echo "Building client..."
cd src/Client
npm install
npm run build
cd ../..

# Create nginx html directory if it doesn't exist
mkdir -p nginx-html

# Copy client dist to nginx-html
cp -r src/Client/dist/* nginx-html/

# Build and start containers
echo "Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "Space Blog is now running!"
echo "  - Web App: http://localhost"
echo "  - API: http://localhost/api/v1"
echo "  - Swagger: http://localhost/swagger"
echo ""
echo "To stop: docker-compose down"
