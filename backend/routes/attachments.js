const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const Attachment = require('../models/Attachment');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Get attachments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const attachments = await Attachment.find({ task: req.params.taskId }).populate('uploadedBy');
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload attachment
router.post('/', auth, upload.single('file'), async (req, res) => {
  const attachment = new Attachment({
    task: req.body.task,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user.id,
  });
  try {
    const newAttachment = await attachment.save();
    res.status(201).json(newAttachment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete attachment
router.delete('/:id', auth, async (req, res) => {
  try {
    await Attachment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;