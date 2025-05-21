const mongoose = require('mongoose');

const diaryPageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  contentType: {
    type: String,
    enum: ['diary', 'panel'],
    default: 'panel'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DiaryPage', diaryPageSchema);
