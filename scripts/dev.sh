#!/bin/bash

# Space Blog - Development Script
set -e

echo "Starting Space Blog in development mode..."

# Start API in background
echo "Starting API..."
cd src/Api/Space.Api
dotnet run &
API_PID=$!
cd ../../..

# Start client
echo "Starting client..."
cd src/Client
npm run dev &
CLIENT_PID=$!
cd ../..

# Wait for both processes
echo "API running on http://localhost:5000"
echo "Client running on http://localhost:5173"
echo "Press Ctrl+C to stop both services"

trap "kill $API_PID $CLIENT_PID 2>/dev/null" EXIT

wait
