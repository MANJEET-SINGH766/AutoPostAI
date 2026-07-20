// @desc    Generate social media content & optional media using AI
// @route   POST /api/ai/generate
// @access  Private
const generateContent = async (req, res) => {
  const { prompt, tone, aiImage } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'Please provide a prompt/topic description' });
  }

  const selectedTone = tone || 'Professional';

  try {
    // Generate text content based on the selected tone
    let contentText = '';
    const emojis = {
      Professional: '💼📈',
      Creative: '🎨✨💡',
      Funny: '😂🎭🍿',
      Minimalist: '📐☕',
      Excited: '🚀🔥🎉'
    };

    const tonePrefixes = {
      Professional: `Here is a professional take on "${prompt}":\n\n`,
      Creative: `Unlocking creative ideas about "${prompt}":\n\n`,
      Funny: `Wait, let's look at "${prompt}" from a funny angle:\n\n`,
      Minimalist: `Simplifying "${prompt}":\n\n`,
      Excited: `AMAZING NEWS about "${prompt}"! 🚀\n\n`
    };

    const selectedEmojis = emojis[selectedTone] || '✨';
    const prefix = tonePrefixes[selectedTone] || '';

    // Simulate AI generation output by expanding the prompt dynamically
    contentText = `${prefix}We are discussing ${prompt}. It is crucial to stay ahead of the curve. What are your thoughts on this? Let's build together! ${selectedEmojis}\n\n#${selectedTone.toLowerCase()} #innovation #growth`;

    // Generate placeholder Unsplash image matching keywords from the prompt
    let mediaUrl = null;
    if (aiImage) {
      // Extract first 2 words from prompt as search keyword
      const keyword = prompt.split(' ').slice(0, 2).join(',').replace(/[^a-zA-Z,]/g, '') || 'technology';
      mediaUrl = `https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&q=keyword_${keyword}`;
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    res.json({
      content: contentText,
      mediaUrl,
      tone: selectedTone,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateContent,
};
