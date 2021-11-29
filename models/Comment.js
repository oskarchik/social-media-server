const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    postId: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
    text: {
      type: String,
      max: 500,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment', default: [] }],
    isSubComment: { type: Boolean, default: false },
    hasSubComments: { type: Boolean, default: false },
    totalComments: { type: Number, default: 0 },
  },

  { timestamps: true }
);

function autoPopulateComments(next) {
  this.populate('comments userId likes');
  next();
}

commentSchema.pre('findById', autoPopulateComments).pre('find', autoPopulateComments);

module.exports = mongoose.model('Comment', commentSchema);
