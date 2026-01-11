const express = require('express');
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const router = express.Router();

// Get comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId }).populate('author');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create comment
router.post('/', auth, async (req, res) => {
  const comment = new Comment({ ...req.body, author: req.user.id });
  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;