const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const router = express.Router();

// Search tasks and projects
router.get('/', auth, async (req, res) => {
  const { q } = req.query;
  try {
    const tasks = await Task.find({ name: new RegExp(q, 'i') }).populate('list').populate('assignee');
    const projects = await Project.find({ name: new RegExp(q, 'i') });
    res.json({ tasks, projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;