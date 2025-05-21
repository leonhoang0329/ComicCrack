#!/bin/bash

echo "Installing KinFlick dependencies..."

echo "Installing backend dependencies..."
cd KinFlick/backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Installation complete!"
echo "Run 'npm start' to start the application"