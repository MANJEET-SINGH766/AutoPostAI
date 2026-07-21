const SocialAccount = require('../models/SocialAccount');
const User = require('../models/User');
const { default: Zernio } = require('@zernio/node');

const zernio = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

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

    if (!process.env.ZERNIO_API_KEY) {
      return res.status(400).json({ message: 'Zernio API key is not configured.' });
    }

    // Lazily create Zernio Profile if not already created
    let zernioProfileId = req.user.zernioProfileId;
    if (!zernioProfileId) {
      try {
        const { data: profileData } = await zernio.profiles.createProfile({
          body: {
            name: `user_${req.user._id}`,
            description: `Profile for ${req.user.email}`,
          },
        });
        if (profileData && profileData.profile && profileData.profile._id) {
          zernioProfileId = profileData.profile._id;
          await User.findByIdAndUpdate(req.user._id, { zernioProfileId });
          req.user.zernioProfileId = zernioProfileId;
        }
      } catch (err) {
        console.error('Failed to create lazy Zernio profile:', err.message);
        return res.status(500).json({ message: `Could not create Zernio Profile: ${err.message}` });
      }
    }

    const callbackUrl = `${serverUrl}/api/social-auth/callback?userId=${req.user._id}`;

    // Request connection URL using official SDK
    const { data } = await zernio.connect.getConnectUrl({
      path: {
        platform: platform.toLowerCase()
      },
      query: {
        profileId: zernioProfileId,
        redirect_url: callbackUrl
      }
    });

    if (!data || !data.authUrl) {
      return res.status(500).json({ message: 'No authorization URL returned from Zernio.' });
    }

    res.json({ url: data.authUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    OAuth Callback Handler (called by Zernio)
// @route   GET /api/social-auth/callback
// @access  Public
const handleCallback = async (req, res) => {
  const { userId, user_id } = req.query;
  const targetUserId = userId || user_id;

  if (!targetUserId) {
    return res.status(400).json({ message: 'Missing user ID in callback' });
  }

  try {
    const user = await User.findById(targetUserId);
    if (!user || !user.zernioProfileId) {
      return res.status(400).json({ message: 'User or Zernio Profile not found' });
    }

    // Retrieve all connected accounts from Zernio
    const { data } = await zernio.accounts.listAccounts({
      query: {
        profileId: user.zernioProfileId
      }
    });

    if (data && data.accounts) {
      for (const account of data.accounts) {
        await SocialAccount.findOneAndUpdate(
          { userId: user._id, platform: account.platform.toLowerCase() },
          {
            accountId: account._id,
            handle: account.handle || 'connected_account',
            status: account.status || 'active',
          },
          { upsert: true, new: true }
        );
      }
    }

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

// @desc    Disconnect / Delete a connected social account
// @route   DELETE /api/social-auth/:id
// @access  Private
const disconnectAccount = async (req, res) => {
  try {
    const account = await SocialAccount.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: 'Social account connection not found' });
    }

    // Call Zernio API using the SDK to delete/disconnect the account
    if (account.accountId) {
      try {
        await zernio.accounts.delete({
          path: { accountId: account.accountId },
        });
      } catch (err) {
        console.error(`Failed to delete account on Zernio: ${err.message}`);
      }
    }

    // Update status to disconnected locally so it is hidden from sync
    account.status = 'disconnected';
    await account.save();

    res.json({ message: 'Account disconnected successfully', accountId: account._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConnectUrl,
  handleCallback,
  syncAccounts,
  disconnectAccount,
};
