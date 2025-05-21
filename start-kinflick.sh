#!/bin/bash

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:"$1" >/dev/null 2>&1
  return $?
}

# Find an available port starting from 5000
find_available_port() {
  local port=5000
  while is_port_in_use $port; do
    echo "Port $port is in use, trying next port..."
    port=$((port + 1))
  done
  echo $port
}

# Kill any processes still using our ports
cleanup_ports() {
  echo "Cleaning up any processes using our ports..."
  if is_port_in_use 5000; then
    # Find PID
    PID=$(lsof -t -i:5000)
    if [ ! -z "$PID" ]; then
      echo "Killing process $PID using port 5000"
      kill -9 $PID
    fi
  fi
}

# Try to clean up ports first
cleanup_ports

# Navigate to the KinFlick directory
cd KinFlick

# Make sure directories exist
mkdir -p backend/uploads

# Install root dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing root dependencies..."
  npm install
fi

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Find available port
PORT=$(find_available_port)
echo "Using port $PORT for KinFlick"

# Create a temporary .env file with the correct port
echo "PORT=$PORT" > backend/.env.temp
cat backend/.env >> backend/.env.temp
mv backend/.env.temp backend/.env

# Start the unified server
echo "Starting unified server..."
NODE_ENV=production PORT=$PORT node backend/server.js

echo "KinFlick is running at http://localhost:$PORT"