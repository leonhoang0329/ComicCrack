#!/bin/bash

# Move to the KinFlick directory
cd KinFlick

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing root dependencies..."
  npm install
fi

if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
fi

# Start development servers
echo "Starting development servers..."
npm run dev

echo "KinFlick is running in development mode"
echo "Backend at http://localhost:5000"
echo "Frontend at http://localhost:3000"