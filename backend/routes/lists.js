const express = require('express');
const auth = require('../middleware/auth');
const List = require('../models/List');
const router = express.Router();

// Get lists for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const lists = await List.find({ project: req.params.projectId }).sort('order');
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create list
router.post('/', auth, async (req, res) => {
  const list = new List(req.body);
  try {
    const newList = await list.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update list
router.put('/:id', auth, async (req, res) => {
  try {
    const list = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete list
router.delete('/:id', auth, async (req, res) => {
  try {
    await List.findByIdAndDelete(req.params.id);
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;