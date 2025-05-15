const mongoose = require('mongoose');
const Reply = require('./Reply');

const threadSchema = new mongoose.Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Thread', threadSchema);