const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('List', listSchema);