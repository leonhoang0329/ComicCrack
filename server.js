// This file is only used for API routes in Vercel environment
// The frontend is served by Vercel's built-in static file server

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes - adjust paths if needed for Vercel
const authRoutes = require('./KinFlick/backend/routes/auth');
const photoRoutes = require('./KinFlick/backend/routes/photos');
const diaryRoutes = require('./KinFlick/backend/routes/diary');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MONGODB_URI not provided, database functionality will not work');
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/diary', diaryRoutes);

// Debug route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Status route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Handle API 404s
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Only listen when running directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
module.exports = app;