const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const User = require('../models/User');
const Project = require('../models/Project');
const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', auth, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all projects (admin only)
router.get('/projects', auth, authorize(['admin']), async (req, res) => {
  try {
    const projects = await Project.find().populate('owner').populate('members');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete any project (admin only)
router.delete('/projects/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project members (admin only)
router.put('/projects/:id/members', auth, authorize(['admin']), async (req, res) => {
  try {
    const { members } = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, { members }, { new: true }).populate('owner').populate('members');
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;