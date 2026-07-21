/**
 * LinkedIn Services for handling API calls.
 */

/**
 * Fetch LinkedIn user profile information.
 * @param {string} accessToken - LinkedIn OAuth access token
 * @returns {Promise<object>} LinkedIn user profile data
 */
const getProfile = async (accessToken) => {
  try {
    // Real API call (LinkedIn v2 Profile API)
    const response = await fetch('https://api.linkedin.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error.message);
    throw error;
  }
};

/**
 * Share a post/update on LinkedIn.
 * @param {string} accessToken - LinkedIn OAuth access token
 * @param {string} text - The post content text
 * @param {string[]} mediaUrls - Optional list of media URLs to attach
 * @returns {Promise<object>} Results containing platform post ID and status
 */
const sharePost = async (accessToken, text, mediaUrls = []) => {
  try {
    // Get the user's LinkedIn URN (member ID) first
    const profile = await getProfile(accessToken);
    const authorUrn = `urn:li:person:${profile.id}`;

    // Construct the UGC share body
    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // If media exists, append media details
    if (mediaUrls.length > 0) {
      body.specificContent['com.linkedin.ugc.ShareContent'].media = mediaUrls.map((url) => ({
        status: 'READY',
        description: { text: 'Shared via Social Scheduler' },
        originalUrl: url,
        title: { text: 'Post Image' },
      }));
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LinkedIn share failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      platformPostId: data.id,
    };
  } catch (error) {
    console.error('Error posting to LinkedIn:', error.message);
    throw error;
  }
};

module.exports = {
  getProfile,
  sharePost,
};
