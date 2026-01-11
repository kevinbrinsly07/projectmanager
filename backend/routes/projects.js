const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    owner: req.user.id,
    members: req.body.members || [],
  });
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get project by id
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner').populate('members');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id && !project.members.some(m => m._id.toString() === req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id && !project.members.some(m => m._id.toString() === req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;