const express = require('express');
const router = express.Router();
const { upload, uploadPhotos, getUserPhotos, deletePhoto } = require('../controllers/photoController');
const auth = require('../middleware/auth');

// Upload photos
router.post('/upload', auth, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    uploadPhotos(req, res);
  });
});

// Get user photos
router.get('/', auth, getUserPhotos);

// Delete a photo
router.delete('/:id', auth, deletePhoto);

module.exports = router;
