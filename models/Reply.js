const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
  created_on: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reply', replySchema);