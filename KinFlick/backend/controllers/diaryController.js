const DiaryPage = require('../models/DiaryPage');
const Photo = require('../models/Photo');
const claudeService = require('../services/claudeService');

// Create a diary page
exports.createDiaryPage = async (req, res) => {
  try {
    console.log('Backend: createDiaryPage called', { body: req.body, user: req.user?._id });
    const { photoIds } = req.body;

    if (!photoIds || photoIds.length === 0) {
      console.log('Backend: No photos selected');
      return res.status(400).json({ message: 'No photos selected' });
    }

    // Fetch photos from database
    console.log('Backend: Fetching photos from database', { photoIds });
    const photos = await Photo.find({
      _id: { $in: photoIds },
      user: req.user._id
    });
    console.log(`Backend: Found ${photos.length} photos`);

    if (photos.length === 0) {
      console.log('Backend: No valid photos found');
      return res.status(404).json({ message: 'No valid photos found' });
    }

    // Generate content using Claude Vision
    console.log('Backend: Calling Claude Vision service');
    const content = await claudeService.generateDiaryContent(photos);
    console.log('Backend: Generated content from Claude Vision');

    // Create diary page
    console.log('Backend: Creating diary page in database');
    const diaryPage = await DiaryPage.create({
      user: req.user._id,
      photos: photoIds,
      content
    });

    // Populate photos for response
    await diaryPage.populate('photos');
    console.log('Backend: Diary page created successfully', { diaryPageId: diaryPage._id });

    res.status(201).json(diaryPage);
  } catch (error) {
    console.error('Backend: Diary creation error:', error);
    console.error('Backend: Stack trace:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all diary pages for a user
exports.getUserDiaryPages = async (req, res) => {
  try {
    const diaryPages = await DiaryPage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('photos');
    
    res.json(diaryPages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific diary page
exports.getDiaryPage = async (req, res) => {
  try {
    const diaryPage = await DiaryPage.findById(req.params.id).populate('photos');

    if (!diaryPage) {
      return res.status(404).json({ message: 'Diary page not found' });
    }

    // Check user
    if (diaryPage.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(diaryPage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a diary page
exports.deleteDiaryPage = async (req, res) => {
  try {
    const diaryPage = await DiaryPage.findById(req.params.id);

    if (!diaryPage) {
      return res.status(404).json({ message: 'Diary page not found' });
    }

    // Check user
    if (diaryPage.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await diaryPage.deleteOne();

    res.json({ message: 'Diary page deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
