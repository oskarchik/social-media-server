const bcrypt = require('bcrypt');
const User = require('../models/User');

const passwordUpdate = async (req, res) => {
  const { password, updatePassword } = req.body;
  const userId = req.params.id;
  let existingUser;
  try {
    existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'user not found' });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }

  if (userId !== req.body.userId || !existingUser.isAdmin) {
    return res.status(403).json({ error: 'You can only update your account' });
  }

  if (!password) {
    return res.status(400).json({ error: 'password is required' });
  }
  console.log(password, existingUser.password);
  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'invalid password' });
  }
  try {
    if (!updatePassword) {
      return res.status(400).json({ error: 'new password needed' });
    }
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(updatePassword, salt);
    let userUpdated = req.body;
    userUpdated.password = newPassword;

    const newUser = await User.findByIdAndUpdate(
      existingUser._id,
      {
        $set: userUpdated,
      },
      { new: true }
    ).select(['-password', '-isAdmin', '-createdAt']);
    return res.status(200).json({ user: newUser });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const fieldUpdate = async (req, res) => {
  const userId = req.params.id;
  let existingUser;
  try {
    existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'user not found' });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }

  if (userId !== req.body.userId) {
    return res.status(403).json({ error: 'You can only update your account' });
  }

  try {
    const updateUser = req.body;
    const userUpdated = await User.findByIdAndUpdate(
      existingUser._id,
      {
        $set: updateUser,
      },
      { new: true }
    ).select(['-password', '-isAdmin', '-createdAt']);
    return res.status(200).json(userUpdated);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const userDelete = async (req, res) => {
  const userId = req.params.id;
  let existingUser;
  try {
    existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'user not found' });
    }
    console.log('user', existingUser);
  } catch (error) {
    return res.status(500).json({ error });
  }
  if (userId !== req.body.userId) {
    return res.status(403).json({ error: 'You can only delete your account' });
  }
  try {
    const deletingUser = await User.findByIdAndDelete({ _id: userId });
    return res.status(200).json(deletingUser);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const userGet = async (req, res) => {
  const userId = req.params.id;

  try {
    const existingUser = await User.findById({ _id: userId }).select(['-password']);
    if (!existingUser) {
      return res.status(404).json({ error: 'user not found' });
    }
    return res.status(200).json({ user: existingUser });
  } catch (error) {
    return res.status(500).json({ error: 'invalid data' });
  }
};

const userGetAll = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ error: 'No users found' });
    }

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

const followUserUpdate = async (req, res) => {
  const userId = req.params.id; //current user

  if (req.body.userId !== userId) {
    try {
      const user = await User.findById({ _id: userId }); //current user
      const followUser = await User.findById({ _id: req.body.userId }); //user to follow

      if (!user.following.includes(req.body.userId)) {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $push: { following: req.body.userId } },
          { new: true }
        );
        const updatedFollowUser = await User.findByIdAndUpdate(
          followUser._id,
          { $push: { followers: userId } },
          { new: true }
        );
        console.log(updatedUser, updatedFollowUser);
        return res.status(200).json({ msg: 'user followed' });
      } else {
        return res.status(403).json({ error: 'User is already followed' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'error' });
    }
  } else {
    return res.status(403).json({ error: 'You can not follow yourself' });
  }
};

const unfollowUserUpdate = async (req, res) => {
  const userId = req.params.id;

  if (req.body.userId !== userId) {
    try {
      const user = await User.findById({ _id: userId });
      const followUser = await User.findById({ _id: req.body.userId });
      if (user.following.includes(req.body.userId)) {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $pull: { following: req.body.userId } },
          { new: true }
        );
        const updatedFollowUser = await User.findByIdAndUpdate(
          followUser._id,
          { $pull: { followers: userId } },
          { new: true }
        );
        console.log(updatedUser, updatedFollowUser);
        return res.status(200).json({ msg: 'user unfollowed' });
      } else {
        return res.status(403).json({ error: 'User is not followed' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'error' });
    }
  } else {
    return res.status(403).json({ error: 'You can not unfollow yourself' });
  }
};
module.exports = {
  passwordUpdate,
  fieldUpdate,
  userDelete,
  userGet,
  userGetAll,
  followUserUpdate,
  unfollowUserUpdate,
};
