// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');

// Import routes
let authRoutes, photoRoutes, diaryRoutes;
try {
  authRoutes = require('./KinFlick/backend/routes/auth');
  photoRoutes = require('./KinFlick/backend/routes/photos');
  diaryRoutes = require('./KinFlick/backend/routes/diary');
} catch (error) {
  console.error('Error loading routes:', error.message);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle uploads directory
try {
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads', { recursive: true });
  }
  app.use('/uploads', express.static('uploads'));
} catch (error) {
  console.error('Error setting up uploads directory:', error.message);
}

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.error('Application will continue but database functionality will not work.');
    });
} else {
  console.log('MONGODB_URI not provided, database functionality will not work');
}

// API Routes
if (authRoutes && photoRoutes && diaryRoutes) {
  app.use('/api/auth', authRoutes);
  app.use('/api/photos', photoRoutes);
  app.use('/api/diary', diaryRoutes);
}

// Handle /api requests that didn't match any routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static files from the React app
const buildPath = path.join(__dirname, 'KinFlick/frontend/build');
app.use(express.static(buildPath));

// Debug route
app.get('/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    buildPath: buildPath,
    exists: fs.existsSync(buildPath),
    files: fs.existsSync(buildPath) ? fs.readdirSync(buildPath) : []
  });
});

// The "catchall" handler: for any request that doesn't match routes above
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(buildPath, 'index.html'))) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(500).send('Frontend build not found. Please run npm run build first.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});