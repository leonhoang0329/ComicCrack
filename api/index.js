// API handler for Vercel Serverless Functions
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Initialize express app
const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Middleware for parsing JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Set up multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Load models
let User, Photo, DiaryPage;
try {
  User = require('../KinFlick/backend/models/User');
  Photo = require('../KinFlick/backend/models/Photo');
  DiaryPage = require('../KinFlick/backend/models/DiaryPage');
} catch (err) {
  console.error('Error loading models:', err.message);
}

// Status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mongoConnection: mongoose.connection.readyState,
    environment: process.env.NODE_ENV || 'development'
  });
});

// AUTH ROUTES
// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user: { _id: user._id } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { _id: user._id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Save user
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { user: { _id: user._id } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { _id: user._id, email: user.email } });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PHOTO ROUTES
// Get user photos
app.get('/api/photos', authMiddleware, async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.user._id }).sort({ uploadDate: -1 });
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload photos
app.post('/api/photos/upload', authMiddleware, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const photos = [];

    // Process each file
    for (const file of req.files) {
      try {
        // Convert buffer to base64 string for Cloudinary
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
          folder: 'kinflick',
          resource_type: 'image',
          public_id: `${req.user._id}_${Date.now()}`
        });

        // Create photo record in database
        const newPhoto = await Photo.create({
          user: req.user._id,
          filename: file.originalname,
          path: uploadResponse.secure_url,  // Store Cloudinary URL as path for backwards compatibility
          cloudinaryId: uploadResponse.public_id,
          cloudinaryUrl: uploadResponse.secure_url,
          caption: ''
        });

        photos.push(newPhoto);
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        // Continue with next file
      }
    }

    if (photos.length === 0) {
      return res.status(500).json({ message: 'Failed to upload any photos to cloud storage' });
    }

    res.status(201).json({
      message: 'Photos uploaded successfully',
      count: photos.length,
      photos
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete photo
app.delete('/api/photos/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check user
    if (photo.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (photo.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }
    
    // Delete from DB
    await photo.deleteOne();

    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DIARY ROUTES
// Get user diary pages
app.get('/api/diary', authMiddleware, async (req, res) => {
  try {
    const diaryPages = await DiaryPage.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(diaryPages);
  } catch (error) {
    console.error('Get diary pages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific diary page
app.get('/api/diary/:id', authMiddleware, async (req, res) => {
  try {
    const diaryPage = await DiaryPage.findById(req.params.id);
    
    if (!diaryPage) {
      return res.status(404).json({ message: 'Diary page not found' });
    }

    // Check user
    if (diaryPage.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(diaryPage);
  } catch (error) {
    console.error('Get diary page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create diary page
app.post('/api/diary', authMiddleware, async (req, res) => {
  try {
    const { photoIds } = req.body;
    
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ message: 'Photo IDs are required' });
    }

    // Get the photos
    const photos = await Photo.find({
      _id: { $in: photoIds },
      user: req.user._id
    });

    if (photos.length === 0) {
      return res.status(404).json({ message: 'No valid photos found' });
    }

    // Create diary page with placeholder content
    const diaryPage = await DiaryPage.create({
      user: req.user._id,
      photos: photoIds,
      title: 'My Diary Page',
      content: 'This is a diary page created with my photos.',
      style: 'default',
      isPublic: false
    });

    res.status(201).json(diaryPage);
  } catch (error) {
    console.error('Create diary page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete diary page
app.delete('/api/diary/:id', authMiddleware, async (req, res) => {
  try {
    const diaryPage = await DiaryPage.findById(req.params.id);
    
    if (!diaryPage) {
      return res.status(404).json({ message: 'Diary page not found' });
    }

    // Check user
    if (diaryPage.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete from DB
    await diaryPage.deleteOne();

    res.json({ message: 'Diary page deleted' });
  } catch (error) {
    console.error('Delete diary page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 404 for any other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Export the Express app as a serverless function
module.exports = (req, res) => {
  app(req, res);
};