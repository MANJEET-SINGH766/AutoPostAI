const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['twitter', 'linkedin', 'facebook', 'instagram'],
      lowercase: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'expired', 'disconnected'],
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    accountId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
