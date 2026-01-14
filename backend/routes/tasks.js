const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const Task = require('../models/Task');
const List = require('../models/List');
const User = require('../models/User');
const { createNotification } = require('./notifications');
const router = express.Router();

// Debug: Get all tasks with their assignees
router.get('/debug/all', auth, async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('assignee').populate('list');
    const taskInfo = tasks.map(t => ({
      name: t.name,
      assignee: t.assignee ? { id: t.assignee._id, name: t.assignee.name } : null,
      list: t.list.name
    }));
    res.json({ currentUserId: req.user.id, currentUserIdType: typeof req.user.id, tasks: taskInfo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ list: { $in: await List.find({ project: req.params.projectId }).select('_id') } }).populate('assignee').populate('list').populate('subtasks');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks for current user
router.get('/user', auth, async (req, res) => {
  try {
    console.log('=== FETCHING USER TASKS ===');
    console.log('Current user ID:', req.user.id);
    
    // Find all projects where user is owner or member
    const Project = require('../models/Project');
    const userProjects = await Project.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id }
      ]
    }).select('_id');
    
    const projectIds = userProjects.map(p => p._id);
    console.log('User project IDs:', projectIds);
    
    // Find all lists in these projects
    const userLists = await List.find({ project: { $in: projectIds } }).select('_id');
    const listIds = userLists.map(l => l._id);
    console.log('User list IDs:', listIds);
    
    // Get all tasks from these lists
    const tasks = await Task.find({ list: { $in: listIds } })
    .populate({
      path: 'list',
      populate: { path: 'project', select: 'name' }
    })
    .populate('assignee');
    
    console.log('Found tasks for current user:', tasks.length);
    console.log('=== END ===\n');
    
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post('/', auth, authorize(['admin']), async (req, res) => {
  console.log('=== CREATING TASK ===');
  console.log('Request body:', req.body);
  const task = new Task(req.body);
  try {
    const newTask = await task.save();
    console.log('Task created successfully:', newTask._id);
    console.log('=== END ===\n');
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating task:', req.params.id, 'with data:', req.body);
    
    // Get the current task before updating
    const currentTask = await Task.findById(req.params.id).populate('list').populate({
      path: 'list',
      populate: { path: 'project' }
    });
    
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check authorization: user must be admin or task assignee
    const currentUser = await User.findById(req.user.id);
    console.log('Current user:', currentUser.name, 'Role:', currentUser.role, 'ID:', currentUser._id.toString());
    console.log('Task assignee:', currentTask.assignee, 'Task assignee ID:', currentTask.assignee?._id?.toString() || 'null');
    console.log('req.user.id:', req.user.id, 'type:', typeof req.user.id);
    
    if (currentUser.role !== 'admin' && (!currentTask.assignee || currentTask.assignee._id.toString() !== req.user.id.toString())) {
      console.log('Authorization failed - returning 403');
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }
    
    const oldStatus = currentTask.status;
    const newStatus = req.body.status;
    
    // Update the task
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee')
      .populate('list');
    
    console.log('Updated task:', task);
    
    // Check if status was changed and user is not admin
    if (newStatus && oldStatus !== newStatus && currentUser.role !== 'admin') {
      // Get all admin users
      const admins = await User.find({ role: 'admin' });
      
      // Create notification for each admin
      const notificationMessage = `Task "${task.name}" in project "${currentTask.list?.project?.name || 'Unknown'}" was moved from ${oldStatus} to ${newStatus} by ${currentUser.name}`;
      
      for (const admin of admins) {
        await createNotification(admin._id, notificationMessage, 'general');
      }
      
      console.log(`Notifications sent to ${admins.length} admins about task status change`);
    }
    
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
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