#!/bin/bash

# Start the backend and frontend in separate terminals
echo "Starting KinFlick application..."

# Change directory to backend and start the server
cd KinFlick/backend
echo "Starting backend server..."
npm install
npm start &

# Change directory to frontend and start the React app
cd ../frontend
echo "Starting frontend server..."
npm install
npm start &

echo "KinFlick is running!"
echo "Backend at: http://localhost:5000"
echo "Frontend at: http://localhost:3000"