const { generatePostContent } = require('../services/geminiService');

// @desc    Generate social media content using Google Gemini AI SDK
// @route   POST /api/ai/generate
// @access  Private
const generateContent = async (req, res) => {
  const {
    platform,
    topic,
    tone = 'Professional',
    length = 'Medium',
    targetAudience = '',
    hashtags = true,
    emojis = true,
    callToAction = true
  } = req.body;

  // Validate topic input
  if (!topic || !topic.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a topic or theme description' 
    });
  }

  // Validate platform input
  if (!platform || !platform.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please select a target social platform' 
    });
  }

  const allowedPlatforms = ['linkedin', 'twitter', 'twitter/x', 'x', 'facebook', 'instagram'];
  if (!allowedPlatforms.includes(platform.toLowerCase())) {
    return res.status(400).json({ 
      success: false, 
      message: `Unsupported platform: '${platform}'. Must be one of: ${allowedPlatforms.join(', ')}` 
    });
  }

  try {
    const result = await generatePostContent({
      platform,
      topic,
      tone,
      length,
      targetAudience,
      hashtags,
      emojis,
      callToAction
    });

    res.json({
      success: true,
      content: result.content,
      hashtags: result.hashtags,
      estimatedReadingTime: result.estimatedReadingTime
    });
  } catch (error) {
    console.error('aiController generateContent error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while generating content.' 
    });
  }
};

module.exports = {
  generateContent,
};
