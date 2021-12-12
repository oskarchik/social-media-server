const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      max: 500,
    },
    image: {
      type: String,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment', default: [] }],
    totalComments: { type: Number, default: 0 },
    postRef: { type: mongoose.Types.ObjectId, ref: 'Post' },
    mentions: { type: Array, default: [] },
  },
  { timestamps: true }
);

function autoPopulateComments(next) {
  this.populate('comments userId likes');
  next();
}

postSchema.pre('findById', autoPopulateComments).pre('find', autoPopulateComments);

module.exports = mongoose.model('Post', postSchema);
