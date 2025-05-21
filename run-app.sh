#!/bin/bash

echo "Starting KinFlick application..."

# Navigate to the KinFlick directory
cd "$(dirname "$0")/KinFlick"

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:"$1" >/dev/null 2>&1
  return $?
}

# Find an available port
PORT=5000
while is_port_in_use $PORT; do
  echo "Port $PORT is in use, trying next port..."
  PORT=$((PORT + 1))
done

# Set environment variables
export PORT=$PORT
export NODE_ENV=production

# Ensure uploads directory exists
mkdir -p uploads

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if nc -z localhost 27017 2>/dev/null; then
  echo "MongoDB appears to be running"
else
  echo "WARNING: MongoDB does not appear to be running on localhost:27017"
  echo "The application will start but database features may not work correctly."
  echo "Please make sure MongoDB is installed and running."
fi

# Build frontend if needed
if [ ! -d "frontend/build" ]; then
  echo "Building frontend..."
  cd frontend
  npm run build
  cd ..
fi

# Start server
echo "Starting server on port $PORT..."
node backend/server.js