const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { default: Zernio } = require('@zernio/node');

const zernio = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

// Helper function to sign JWT tokens
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      let zernioProfileId = '';
      try {
        const { data } = await zernio.profiles.createProfile({
          body: {
            name: `user_${user._id}`,
            description: `Profile for ${user.email}`,
          },
        });
        if (data && data.profile && data.profile._id) {
          zernioProfileId = data.profile._id;
          user.zernioProfileId = zernioProfileId;
          await user.save();
        }
      } catch (err) {
        console.error('Failed to create Zernio profile on registration:', err.message);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        zernioProfileId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};
