const Photo = require('../models/Photo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

// Init upload
exports.upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter
}).array('photos', 10); // Max 10 photos at once

// Upload photos
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const photos = [];

    for (const file of req.files) {
      const newPhoto = await Photo.create({
        user: req.user._id,
        filename: file.filename,
        path: file.path,
        caption: ''
      });

      photos.push(newPhoto);
    }

    res.status(201).json({
      message: 'Photos uploaded successfully',
      count: photos.length,
      photos
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user photos
exports.getUserPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.user._id })
      .sort({ uploadDate: -1 });
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete photo
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check user
    if (photo.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete photo file
    fs.unlinkSync(photo.path);
    
    // Delete from DB
    await photo.deleteOne();

    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};