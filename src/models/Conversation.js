const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    members: [{ type: String, default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
