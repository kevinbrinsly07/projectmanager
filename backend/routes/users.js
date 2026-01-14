const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get all users (for adding members)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('name email _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;