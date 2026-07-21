const express = require('express');
const { getConnectUrl, handleCallback, syncAccounts, disconnectAccount } = require('../controllers/socialAuthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public callback path hit by OAuth service
router.get('/callback', handleCallback);

// Private protected endpoints requiring JWT sessions
router.get('/connect/:platform', protect, getConnectUrl);
router.get('/sync', protect, syncAccounts);
router.delete('/:id', protect, disconnectAccount);

module.exports = router;
