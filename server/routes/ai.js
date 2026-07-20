const express = require('express');
const { generateContent } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Secure AI endpoint using protect token verification middleware
router.post('/generate', protect, generateContent);

module.exports = router;
