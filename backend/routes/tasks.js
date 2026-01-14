const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const Task = require('../models/Task');
const List = require('../models/List');
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
    console.log('User ID type:', typeof req.user.id);
    
    // First, let's see ALL tasks with assignees
    const allTasks = await Task.find({}).populate('assignee');
    console.log('Total tasks in DB:', allTasks.length);
    console.log('Tasks with assignees:');
    allTasks.forEach(task => {
      console.log(`  - Task: "${task.name}", Assignee: ${task.assignee ? `${task.assignee._id} (${task.assignee.name})` : 'NONE'}`);
    });
    
    // Now try to find user's tasks - since req.user.id is already an ObjectId
    const tasks = await Task.find({ assignee: req.user.id })
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
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log('Updated task:', task);
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