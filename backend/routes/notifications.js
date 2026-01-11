const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const router = express.Router();

// Get notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create notification (internal use)
const createNotification = async (userId, message, type) => {
  const notification = new Notification({ user: userId, message, type });
  await notification.save();
};

module.exports = { router, createNotification };