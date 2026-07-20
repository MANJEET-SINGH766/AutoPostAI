const SocialAccount = require('../models/SocialAccount');

// @desc    Get Zernio OAuth connection URL for a platform
// @route   GET /api/social-auth/connect/:platform
// @access  Private
const getConnectUrl = async (req, res) => {
  const { platform } = req.params;

  const supportedPlatforms = ['twitter', 'linkedin', 'facebook', 'instagram'];
  if (!supportedPlatforms.includes(platform.toLowerCase())) {
    return res.status(400).json({ message: `Unsupported platform: ${platform}` });
  }

  try {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    const isSandboxMode = !process.env.ZERNIO_API_KEY || process.env.ZERNIO_API_KEY.includes('sk_62d4aab5589715b97e16bfcd7b3d406d6a8107810aa0f9dd0ec39b97334da565');

    if (isSandboxMode) {
      // Redirect directly to callback with simulated sandbox profile
      const mockHandles = {
        twitter: 'TwitterSandbox',
        linkedin: 'LinkedInCreator',
        facebook: 'FacebookBiz',
        instagram: 'InstaBrand'
      };
      const handle = mockHandles[platform.toLowerCase()] || 'SandboxUser';
      const url = `${serverUrl}/api/social-auth/callback?platform=${platform}&handle=${handle}&access_token=mock_access_token&refresh_token=mock_refresh_token&user_id=${req.user._id}`;
      return res.json({ url });
    }

    const zernioBaseUrl = 'https://api.zernio.com/oauth/connect';
    const callbackUrl = encodeURIComponent(`${serverUrl}/api/social-auth/callback`);

    // Build authorization redirect url
    const url = `${zernioBaseUrl}/${platform}?api_key=${process.env.ZERNIO_API_KEY}&user_id=${req.user._id}&redirect_uri=${callbackUrl}`;

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    OAuth Callback Handler (called by Zernio)
// @route   GET /api/social-auth/callback
// @access  Public
const handleCallback = async (req, res) => {
  const { platform, handle, access_token, refresh_token, user_id } = req.query;

  if (!platform || !handle || !user_id) {
    return res.status(400).json({ message: 'Missing callback parameters' });
  }

  try {
    // Save or update connection record
    await SocialAccount.findOneAndUpdate(
      { userId: user_id, platform: platform.toLowerCase() },
      {
        handle,
        status: 'active',
        accessToken: access_token || '',
        refreshToken: refresh_token || '',
      },
      { upsert: true, new: true }
    );

    // Redirect user browser back to client dashboard accounts page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/accounts`);
  } catch (error) {
    res.status(500).send(`Authentication callback error: ${error.message}`);
  }
};

// @desc    Sync / Fetch all connected social profiles
// @route   GET /api/social-auth/sync
// @access  Private
const syncAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({
      userId: req.user._id,
      status: { $ne: 'disconnected' },
    }).select('-accessToken -refreshToken'); // omit secret keys in API response

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConnectUrl,
  handleCallback,
  syncAccounts,
};
