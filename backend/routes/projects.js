const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const Project = require('../models/Project');
const User = require('../models/User');
const { createNotification } = require('./notifications');
const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      // Admin can see all projects
      projects = await Project.find({});
    } else {
      // Regular users only see projects they're owner or member of
      projects = await Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project
router.post('/', auth, authorize(['admin', 'manager']), async (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    owner: req.user.id,
    members: req.body.members || [],
  });
  try {
    const newProject = await project.save();
    
    // Send notifications to members
    if (newProject.members && newProject.members.length > 0) {
      for (const memberId of newProject.members) {
        const member = await User.findById(memberId);
        if (member) {
          const notificationMessage = `You have been added to a new project: "${newProject.name}"`;
          await createNotification(memberId, notificationMessage, 'project_assigned');
        }
      }
    }
    
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
    const ownerId = project.owner._id.toString();
    const userId = req.user.id.toString();
    const isMember = project.members.some(m => m._id.toString() === userId);
    if (ownerId !== userId && !isMember && req.user.role !== 'admin' && req.user.role !== 'manager') {
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
    const ownerId = project.owner.toString();
    const userId = req.user.id.toString();
    const isMember = project.members.some(m => m.toString() === userId);
    if (ownerId !== userId && !isMember && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const oldMembers = project.members.map(m => m.toString());
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const newMembers = updatedProject.members.map(m => m.toString());
    
    // Find newly added members
    const addedMembers = newMembers.filter(m => !oldMembers.includes(m));
    
    // Send notifications to newly added members
    for (const memberId of addedMembers) {
      const member = await User.findById(memberId);
      if (member) {
        const notificationMessage = `You have been added to the project: "${updatedProject.name}"`;
        await createNotification(memberId, notificationMessage, 'project_assigned');
      }
    }
    
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
    const ownerId = project.owner.toString();
    const userId = req.user.id.toString();
    if (ownerId !== userId && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;