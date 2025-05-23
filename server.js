require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./KinFlick/backend/routes/auth');
const photoRoutes = require('./KinFlick/backend/routes/photos');
const diaryRoutes = require('./KinFlick/backend/routes/diary');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Connect to MongoDB
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
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/diary', diaryRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'KinFlick/frontend/build')));

// The "catchall" handler: for any request that doesn't match one
// defined above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'KinFlick/frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});