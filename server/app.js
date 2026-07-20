const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const socialAuthRoutes = require('./routes/socialAuth');
const postRoutes = require('./routes/posts');
const aiRoutes = require('./routes/ai');

const app = express();

// Standard Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/social-auth', socialAuthRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);

// Basic Health/Test Check Endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running smoothly! 🚀' });
});

module.exports = app;
