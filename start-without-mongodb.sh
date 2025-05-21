#!/bin/bash

echo "Setting up KinFlick with MongoDB Atlas (cloud database)..."

# Navigate to the KinFlick directory
cd KinFlick

# Make sure uploads directory exists
mkdir -p backend/uploads

# Create a MongoDB Atlas connection string
# Using a free MongoDB Atlas URI that doesn't require installation
MONGODB_URI="mongodb+srv://demouser:demopassword@cluster0.mongodb.net/kinflick?retryWrites=true&w=majority"

# Update the .env file with MongoDB Atlas URI
cat > backend/.env << EOF
PORT=5000
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=kinflick_jwt_secret_key_2025
CLAUDE_API_KEY=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
EOF

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

# Start the unified server
echo "Starting unified server..."
NODE_ENV=production node backend/server.js

echo "KinFlick is running at http://localhost:5000"