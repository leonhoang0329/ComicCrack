const Photo = require('../models/Photo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');

// For Vercel deployment - use memory storage instead of disk
const storage = multer.memoryStorage();

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
          path: uploadResponse.secure_url,  // Use the Cloudinary URL
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
    console.error('Error in uploadPhotos:', error);
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
    console.error('Error in deletePhoto:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};