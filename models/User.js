const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      min: 2,
      max: 15,
    },
    lastName: {
      type: String,
      min: 2,
      max: 15,
    },
    device: {
      type: String,
      required: true,
      min: 2,
      max: 20,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'custom'],
    },
    avatar: {
      type: String,
      default: '',
    },
    coverPic: {
      type: String,
      default: '',
    },
    posts: [{ type: mongoose.Types.ObjectId, ref: 'Post', default: [] }],
    followers: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
