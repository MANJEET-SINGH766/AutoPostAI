const cron = require('node-cron');
const Post = require('../models/Post');
const SocialAccount = require('../models/SocialAccount');

// Simulated platform publisher call (mocking Zernio publish requests)
const publishToPlatform = async (platform, handle, text, accessToken) => {
  console.log(`📡 [Mock Publish] Publishing to ${platform.toUpperCase()} (@${handle}): "${text.substring(0, 40)}..."`);
  
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate success rate (95% success rate for simulation reliability)
  const isSuccess = Math.random() < 0.95;
  if (!isSuccess) {
    throw new Error('API connection timeout to social platform provider');
  }

  return { success: true, platformPostId: `sim_${Math.random().toString(36).substr(2, 9)}` };
};

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

      let anyFailures = false;
      const errors = [];

      for (const account of post.accounts) {
        try {
          // Trigger the platform-specific publishing API call
          await publishToPlatform(
            account.platform,
            account.handle,
            post.content.text,
            account.accessToken
          );
        } catch (err) {
          console.error(`❌ Failed to publish to ${account.platform.toUpperCase()} (@${account.handle}): ${err.message}`);
          errors.push(`${account.platform.toUpperCase()}: ${err.message}`);
          anyFailures = true;
        }
      }

      // 4. Update final post status based on dispatch results
      if (anyFailures) {
        post.status = 'failed';
        console.log(`⚠️ Post ID ${post._id} finished processing with some failures`);
      } else {
        post.status = 'completed';
        post.publishedAt = new Date();
        console.log(`✅ Post ID ${post._id} successfully published to all targets`);
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
