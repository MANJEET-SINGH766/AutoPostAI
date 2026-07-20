const express = require('express');
const multer = require('multer');
const path = require('path');
const { getPosts, schedulePost, cancelPost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer storage setup for serving uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Apply JWT authentication checks to protect all post operations
router.use(protect);

router.get('/', getPosts);
router.post('/schedule', schedulePost);
router.post('/:id/cancel', cancelPost);
router.delete('/:id', deletePost);

// Upload endpoint returning static public asset link
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  const url = `${serverUrl}/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
