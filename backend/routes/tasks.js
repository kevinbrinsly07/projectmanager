const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const List = require('../models/List');
const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ list: { $in: await List.find({ project: req.params.projectId }).select('_id') } }).populate('assignee').populate('list').populate('subtasks');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  const task = new Task(req.body);
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;