const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['performance', 'behavior', 'achievement', 'improvement'],
    default: 'performance'
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  month: { type: String }, // e.g., "2024-06"
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);