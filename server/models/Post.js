const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialAccount',
      },
    ],
    content: {
      text: {
        type: String,
        required: [true, 'Post text content is required'],
        trim: true,
      },
      mediaUrls: {
        type: [String],
        default: [],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
