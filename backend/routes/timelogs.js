const express = require('express');
const auth = require('../middleware/auth');
const TimeLog = require('../models/TimeLog');
const router = express.Router();

// Get time logs for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const logs = await TimeLog.find({ task: req.params.taskId }).populate('user');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start time tracking
router.post('/start', auth, async (req, res) => {
  const log = new TimeLog({ ...req.body, user: req.user.id, startTime: new Date() });
  try {
    const newLog = await log.save();
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Stop time tracking
router.put('/stop/:id', auth, async (req, res) => {
  try {
    const log = await TimeLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    log.endTime = new Date();
    log.duration = Math.round((log.endTime - log.startTime) / 60000); // minutes
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;