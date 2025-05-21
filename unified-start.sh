#!/bin/bash

# Move to the KinFlick directory
cd KinFlick

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build the frontend for production
echo "Building frontend..."
npm run build

# Start the unified server
echo "Starting unified server..."
cd backend
NODE_ENV=production node server.js

echo "KinFlick is running at http://localhost:5000"