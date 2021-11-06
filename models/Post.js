const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      max: 500,
    },
    image: {
      type: String,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
