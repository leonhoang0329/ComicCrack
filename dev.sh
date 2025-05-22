#!/bin/bash

# Kill any processes using ports 3000 and 5000
kill_port() {
  if lsof -ti:$1 > /dev/null; then
    echo "Killing process on port $1"
    lsof -ti:$1 | xargs kill -9
  fi
}

# Kill processes on ports 3000 and 5000
kill_port 3000
kill_port 5000

# Navigate to project directory
cd "$(dirname "$0")"

# Make sure uploads directory exists
mkdir -p KinFlick/backend/uploads

# Start the backend server
cd KinFlick/backend
echo "Starting backend server on port 5000..."
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start the frontend server
cd ../frontend
echo "Starting frontend server on port 3000..."
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Keep script running
echo "Both servers are running. Press Ctrl+C to stop."
wait