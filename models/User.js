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
      default: 'https://res.cloudinary.com/oscloud/image/upload/v1639365208/social-media-app/profile_ew08od.png',
    },
    coverPic: {
      type: String,
      default: 'https://res.cloudinary.com/oscloud/image/upload/v1641295473/social-media-app/cover-default_y5g6xs.png',
    },
    posts: [{ type: mongoose.Types.ObjectId, ref: 'Post', default: [] }],
    shares: [{ type: mongoose.Types.ObjectId, ref: 'Post', default: [] }],
    contacts: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    sentRequests: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    receivedRequests: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    mentions: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
