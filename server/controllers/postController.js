const Post = require('../models/Post');
const SocialAccount = require('../models/SocialAccount');

// @desc    Get all user posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id })
      .populate('accounts', 'platform handle status')
      .sort({ scheduledAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Schedule a new post
// @route   POST /api/posts/schedule
// @access  Private
const schedulePost = async (req, res) => {
  const { accounts, content, scheduledAt } = req.body;

  // Basic request validations
  if (!accounts || accounts.length === 0) {
    return res.status(400).json({ message: 'Please select at least one social media account' });
  }
  if (!content || !content.text || !content.text.trim()) {
    return res.status(400).json({ message: 'Post content cannot be empty' });
  }
  if (!scheduledAt) {
    return res.status(400).json({ message: 'Please select a scheduled date and time' });
  }

  const scheduleDate = new Date(scheduledAt);
  if (isNaN(scheduleDate.getTime())) {
    return res.status(400).json({ message: 'Invalid scheduled date and time' });
  }

  try {
    // Verify accounts belong to current user and are active
    const userAccounts = await SocialAccount.find({
      _id: { $in: accounts },
      userId: req.user._id,
      status: 'active',
    });

    if (userAccounts.length !== accounts.length) {
      return res.status(400).json({ message: 'One or more selected accounts are invalid or disconnected' });
    }

    const post = await Post.create({
      userId: req.user._id,
      accounts,
      content: {
        text: content.text,
        mediaUrls: content.mediaUrls || [],
      },
      scheduledAt: scheduleDate,
      status: 'pending',
    });

    // Populate accounts for immediate response format matching frontend
    const populatedPost = await post.populate('accounts', 'platform handle status');

    res.status(201).json({
      message: 'Post scheduled successfully!',
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a pending post schedule (mark as cancelled / draft)
// @route   POST /api/posts/:id/cancel
// @access  Private
const cancelPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending posts can be cancelled' });
    }

    post.status = 'cancelled';
    await post.save();

    res.json({ message: 'Post schedule cancelled successfully', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Permanently delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  schedulePost,
  cancelPost,
  deletePost,
};
