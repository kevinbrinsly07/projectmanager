const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);