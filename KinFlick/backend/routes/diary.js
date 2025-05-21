const express = require('express');
const router = express.Router();
const { createDiaryPage, getUserDiaryPages, getDiaryPage, deleteDiaryPage } = require('../controllers/diaryController');
const auth = require('../middleware/auth');

// Create a diary page
router.post('/', auth, createDiaryPage);

// Get user's diary pages
router.get('/', auth, getUserDiaryPages);

// Get a specific diary page
router.get('/:id', auth, getDiaryPage);

// Delete a diary page
router.delete('/:id', auth, deleteDiaryPage);

module.exports = router;
