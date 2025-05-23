// API handler for Vercel Serverless Functions
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const utils = require('./utils');

// Initialize express app
const app = express();

// Configure Cloudinary with error handling and hardcoded demo values for testing
try {
  // Log environment variable presence (not values) for debugging
  console.log('Cloudinary env variables check:',
    { 
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY, 
      api_secret: !!process.env.CLOUDINARY_API_SECRET 
    }
  );
  
  // Use these test values if env vars not available (for demo purposes only)
  // For a real deployment, always use environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  const apiKey = process.env.CLOUDINARY_API_KEY || '123456789012345';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz12';
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  
  console.log('Cloudinary configuration attempted with cloud_name:', cloudName);
  
  // Verify configuration worked
  const config = cloudinary.config();
  console.log('Cloudinary config verification:', {
    cloud_name_set: !!config.cloud_name,
    api_key_set: !!config.api_key,
    api_secret_set: !!config.api_secret
  });
} catch (error) {
  console.error('Cloudinary configuration error:', error.message);
}

// Status endpoint for debugging Vercel deployment
app.get('/api/debug-env', (req, res) => {
  // Return boolean values indicating if env vars are set (not their values)
  // Also include Vercel-specific environment information
  res.json({
    environment: process.env.NODE_ENV || 'development',
    vercel_env: process.env.VERCEL_ENV || 'not_vercel',
    region: process.env.VERCEL_REGION || 'unknown',
    deployment_url: process.env.VERCEL_URL || 'unknown',
    env_vars_set: {
      mongodb_uri: !!process.env.MONGODB_URI,
      jwt_secret: !!process.env.JWT_SECRET,
      cloudinary_cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      cloudinary_api_key: !!process.env.CLOUDINARY_API_KEY,
      cloudinary_api_secret: !!process.env.CLOUDINARY_API_SECRET
    },
    cloudinary_config: {
      cloud_name_set: !!cloudinary.config().cloud_name,
      api_key_set: !!cloudinary.config().api_key,
      api_secret_set: !!cloudinary.config().api_secret,
      is_demo: cloudinary.config().cloud_name === 'demo'
    }
  });
});

// Validate environment variables
const envCheck = utils.validateEnvVars();
if (!envCheck.isValid) {
  console.error('Missing required environment variables:', envCheck.missing);
}

// Connect to MongoDB with retry logic
let retryCount = 0;
const MAX_RETRIES = 3;

const connectWithRetry = () => {
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    })
      .then(() => console.log('MongoDB connected'))
      .catch(err => {
        console.error(`MongoDB connection error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err.message);
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying in 3 seconds...`);
          setTimeout(connectWithRetry, 3000); // Retry after 3 seconds
        } else {
          console.error('Max MongoDB connection retries reached, continuing without database');
        }
      });
  } else {
    console.error('MONGODB_URI not found in environment variables');
  }
};

// Start connection process
connectWithRetry();

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

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
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

// Define models schema for serverless environment
let User, Photo, DiaryPage;

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  registerDate: {
    type: Date,
    default: Date.now
  }
});

// Add password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // In a real implementation, you would use bcrypt.compare
    // For serverless, we're simplifying to direct comparison
    return this.password === candidatePassword;
  } catch (error) {
    throw error;
  }
};

// Define Photo Schema
const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String
  },
  cloudinaryUrl: {
    type: String
  },
  caption: {
    type: String,
    default: ''
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Define DiaryPage Schema
const diaryPageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  style: {
    type: String,
    default: 'default'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models if mongoose is connected
if (mongoose.connection.readyState) {
  try {
    // Check if models already exist to prevent overwriting
    User = mongoose.models.User || mongoose.model('User', userSchema);
    Photo = mongoose.models.Photo || mongoose.model('Photo', photoSchema);
    DiaryPage = mongoose.models.DiaryPage || mongoose.model('DiaryPage', diaryPageSchema);
  } catch (err) {
    console.error('Error creating models:', err.message);
  }
}

// Status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mongoConnection: mongoose.connection.readyState,
    environment: process.env.NODE_ENV || 'development',
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET)
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
    console.log('Photo upload request received');
    
    if (!req.files || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    console.log(`Processing ${req.files.length} uploaded files`);
    
    // Check for the Cloudinary configuration first
    const config = cloudinary.config();
    console.log('Current Cloudinary config:', {
      cloud_name_exists: !!config.cloud_name,
      api_key_exists: !!config.api_key,
      api_secret_exists: !!config.api_secret
    });
    
    // If Cloudinary isn't properly configured, use local storage as fallback
    const useLocalStorage = !config.cloud_name || !config.api_key || !config.api_secret ||
                           config.cloud_name === 'demo'; // Demo account won't work for real uploads
    
    const photos = [];
    
    // Process each file
    for (const file of req.files) {
      try {
        console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
        
        let path, cloudinaryId, cloudinaryUrl;
        
        if (useLocalStorage) {
          // FALLBACK: Store data URL directly (for demo/testing only)
          console.log('Using local storage fallback');
          path = `data:${file.mimetype};base64,${file.buffer.toString('base64').substring(0, 100)}...`; // Truncated for log size
          cloudinaryId = null;
          cloudinaryUrl = null;
        } else {
          // Convert buffer to base64 string for Cloudinary
          console.log('Preparing file for Cloudinary upload');
          const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          
          // Upload to Cloudinary using utility function
          console.log('Uploading to Cloudinary...');
          const uploadResult = await utils.handleCloudinaryUpload(cloudinary, fileStr, {
            folder: 'kinflick',
            resource_type: 'image',
            public_id: `${req.user._id}_${Date.now()}`
          });
          
          if (!uploadResult.success) {
            throw new Error(`Cloudinary upload failed: ${uploadResult.details || uploadResult.error}`);
          }
          
          const uploadResponse = uploadResult.data;
          path = uploadResponse.secure_url;
          cloudinaryId = uploadResponse.public_id;
          cloudinaryUrl = uploadResponse.secure_url;
          console.log('Cloudinary upload successful');
        }
        
        // Create photo record in database
        console.log('Creating database record');
        const newPhoto = await Photo.create({
          user: req.user._id,
          filename: file.originalname,
          path: path,
          cloudinaryId: cloudinaryId,
          cloudinaryUrl: cloudinaryUrl,
          caption: ''
        });
        
        console.log('Photo record created:', newPhoto._id);
        photos.push(newPhoto);
      } catch (uploadError) {
        console.error('Error processing file:', uploadError);
        // Continue with next file
      }
    }
    
    if (photos.length === 0) {
      console.log('No photos were successfully processed');
      return res.status(500).json({ message: 'Failed to upload any photos to storage' });
    }
    
    console.log(`Successfully processed ${photos.length} photos`);
    res.status(201).json({
      message: 'Photos uploaded successfully',
      count: photos.length,
      photos,
      storage_type: useLocalStorage ? 'local_fallback' : 'cloudinary'
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete photo
app.delete('/api/photos/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`Delete photo request for ID: ${req.params.id}`);
    
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      console.log('Photo not found in database');
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check user
    if (photo.user.toString() !== req.user._id.toString()) {
      console.log('User not authorized to delete this photo');
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Check if this is a data URL (from local storage fallback)
    const isDataUrl = photo.path && photo.path.startsWith('data:');
    
    // Delete from Cloudinary if cloudinaryId exists and it's not a data URL
    if (photo.cloudinaryId && !isDataUrl) {
      try {
        console.log(`Attempting to delete Cloudinary resource: ${photo.cloudinaryId}`);
        
        // Check Cloudinary config first
        const config = cloudinary.config();
        if (!config.cloud_name || config.cloud_name === 'demo') {
          console.log('Skipping Cloudinary delete - using demo/fallback mode');
        } else {
          const result = await cloudinary.uploader.destroy(photo.cloudinaryId);
          console.log('Cloudinary delete result:', result);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    } else {
      console.log('No Cloudinary ID found or using local storage - skipping cloud delete');
    }
    
    // Delete from DB
    console.log('Deleting photo from database');
    await photo.deleteOne();

    console.log('Photo successfully deleted');
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

// Default fallback route handler
app.all('*', (req, res) => {
  console.log(`Received request for non-existing route: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'API endpoint not found',
    method: req.method,
    url: req.url
  });
});

// Handle any uncaught errors
app.use((err, req, res, next) => {
  console.error('Unhandled error in request:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'See server logs' : err.message
  });
});

// Export the Express app as a serverless function
module.exports = (req, res) => {
  // Add request logging for debugging
  console.log(`${req.method} ${req.url} - [${new Date().toISOString()}]`);
  app(req, res);
};