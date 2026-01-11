const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const TimeLog = require('../models/TimeLog');
const router = express.Router();

// Get project stats
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ list: { $in: await require('../models/List').find({ project: req.params.projectId }).select('_id') } });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
    const timeLogs = await TimeLog.find({ task: { $in: tasks.map(t => t._id) } });
    const totalTime = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    res.json({ totalTasks, completedTasks, inProgressTasks, totalTime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;