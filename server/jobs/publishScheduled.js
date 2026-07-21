const cron = require('node-cron');
const Post = require('../models/Post');
const SocialAccount = require('../models/SocialAccount');
const { default: Zernio } = require('@zernio/node');

const zernio = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

// Main publisher job execution logic
const checkAndPublishPosts = async () => {
  try {
    const now = new Date();

    // 1. Find all due pending posts
    const duePosts = await Post.find({
      status: 'pending',
      scheduledAt: { $lte: now },
    }).populate('accounts');

    if (duePosts.length === 0) {
      return;
    }

    console.log(`⏱️ Found ${duePosts.length} due posts. Starting publish dispatch worker...`);

    for (const post of duePosts) {
      // Set status to processing so it's not picked up by duplicate runs
      post.status = 'processing';
      await post.save();

      console.log(`⚙️ Processing Post ID: ${post._id}`);

      try {
        const platforms = post.accounts
          .filter(acc => acc.accountId)
          .map(acc => ({
            platform: acc.platform,
            accountId: acc.accountId
          }));

        if (platforms.length === 0) {
          throw new Error('No connected accounts with Zernio Account IDs found for this post');
        }

        await zernio.posts.createPost({
          body: {
            content: post.content.text,
            platforms: platforms,
            publishNow: true
          }
        });

        post.status = 'completed';
        post.publishedAt = new Date();
        console.log(`✅ Post ID ${post._id} successfully published via Zernio`);
      } catch (err) {
        console.error(`❌ Failed to publish Post ID ${post._id} via Zernio: ${err.message}`);
        post.status = 'failed';
      }

      await post.save();
    }
  } catch (error) {
    console.error('❌ Scheduler publish job runner encountered error:', error.message);
  }
};

// Configure Node-Cron to run every minute
const initSchedulerJob = () => {
  console.log('⏰ Initializing automated publishing cron job (runs every minute)');
  cron.schedule('* * * * *', () => {
    checkAndPublishPosts();
  });
};

module.exports = {
  initSchedulerJob,
  checkAndPublishPosts, // exported for testing/manual trigger
};
