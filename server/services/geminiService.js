const { GoogleGenAI } = require('@google/genai');

// Initialize client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Builds a platform-specific prompt targeting tone, audience, and length constraints.
 */
const buildPrompt = ({
  platform,
  topic,
  tone,
  length,
  targetAudience,
  hashtags,
  emojis,
  callToAction
}) => {
  let platformRules = '';
  const cleanPlatform = (platform || '').toLowerCase();

  switch (cleanPlatform) {
    case 'linkedin':
      platformRules = `
- Platform style: LinkedIn. Focus on professional thought leadership, career growth, industry insights, and educational value.
- Writing style: Use short paragraphs, clear section formatting, and professional spacing.
- Persona: Knowledgeable industry professional or team player.
`;
      break;
    case 'twitter':
    case 'twitter/x':
    case 'x':
      platformRules = `
- Platform style: Twitter/X. Focus on viral hooks, engaging, clear, and extremely punchy content.
- Writing style: Conversational and engaging. Keep it concise.
- Constraints: The total content MUST fit well within 280 characters.
`;
      break;
    case 'instagram':
      platformRules = `
- Platform style: Instagram. Focus on storytelling, highly engaging, brand personality, and visually stimulating text.
- Writing style: Warm, friendly, descriptive, with line breaks to separate paragraphs neatly.
`;
      break;
    case 'facebook':
      platformRules = `
- Platform style: Facebook. Focus on community engagement, interactive discussions, conversational tone, and shareability.
- Writing style: Friendly, welcoming, approachable, inviting followers to comment or share.
`;
      break;
    default:
      platformRules = `
- Platform style: Generic social media post.
- Tone: ${tone}.
`;
  }

  // Length guidelines
  let lengthGuide = '';
  switch (length) {
    case 'Short':
      lengthGuide = 'Keep the post very concise (1-2 sentences). For Twitter/X, keep it under 140 characters.';
      break;
    case 'Long':
      lengthGuide = 'Provide a detailed, in-depth post (3+ paragraphs with insights). For Twitter/X, write a thread-like hook or a longer post.';
      break;
    case 'Medium':
    default:
      lengthGuide = 'Provide a balanced post (1-2 paragraphs). For Twitter/X, write a single well-structured tweet under 280 characters.';
  }

  // Emojis, hashtags, and CTA
  const emojiRule = emojis 
    ? 'Integrate relevant emojis naturally throughout the content to add visual interest and warmth.' 
    : 'Do NOT use any emojis. Keep it strictly textual.';
  
  const hashtagRule = hashtags 
    ? 'Provide 2-5 relevant hashtags at the end of the post content.' 
    : 'Do NOT include hashtags.';

  const ctaRule = callToAction 
    ? 'Include a compelling call-to-action (CTA) at the end of the post, inviting feedback, clicks, or responses.' 
    : 'Do NOT include a call-to-action.';

  return `
You are an expert social media copywriter and content strategist.
Your task is to generate a high-performing post based on these settings:

Topic: ${topic}
Tone: ${tone}
Target Audience: ${targetAudience || 'General social media audience'}
Length Guide: ${lengthGuide}

${platformRules}

Formatting requirements:
1. ${emojiRule}
2. ${hashtagRule}
3. ${ctaRule}
4. Write directly to the target audience. Ensure the content feels authentic and tailored.
`;
};

/**
 * Generates post content using Gemini API.
 */
const generatePostContent = async (params) => {
  const { platform, tone, length, targetAudience, hashtags, emojis, callToAction } = params;
  
  const prompt = buildPrompt(params);

  // Define JSON schema for Gemini structured output
  const responseSchema = {
    type: 'OBJECT',
    properties: {
      content: {
        type: 'STRING',
        description: 'The full text of the social media post, containing emojis and hashtags if requested.'
      },
      hashtags: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'List of relevant hashtags generated for the post, including the "#" prefix.'
      },
      estimatedReadingTime: {
        type: 'STRING',
        description: 'Estimated reading time for the post, e.g., "15 sec", "1 min".'
      }
    },
    required: ['content', 'hashtags', 'estimatedReadingTime']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const responseText = typeof response.text === 'function' ? response.text() : response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini API.');
    }

    const result = JSON.parse(responseText);
    return {
      success: true,
      content: result.content,
      hashtags: result.hashtags || [],
      estimatedReadingTime: result.estimatedReadingTime || '30 sec'
    };
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
};

module.exports = {
  generatePostContent
};
