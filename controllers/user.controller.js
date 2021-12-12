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

const sendContactRequestUpdate = async (req, res) => {
  const userId = req.params.id; //current user

  if (req.body.contactRequestId !== userId) {
    try {
      const user = await User.findById({ _id: userId }); //current user
      const requestedUser = await User.findById({ _id: req.body.contactRequestId }); //user to follow

      if (!user.contacts.includes(req.body.contactRequestId)) {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $push: { sentRequests: req.body.contactRequestId } },
          { new: true }
        );
        const updatedRequestedUser = await User.findByIdAndUpdate(
          requestedUser._id,
          { $push: { receivedRequests: userId } },
          { new: true }
        );
        console.log(updatedUser, updatedRequestedUser);
        return res.status(200).json({ user: updatedUser });
      } else {
        return res.status(403).json({ error: 'User is already a contact' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'error' });
    }
  } else {
    return res.status(403).json({ error: 'You can not contact yourself' });
  }
};

const removeContactUpdate = async (req, res) => {
  const userId = req.params.id;
  console.log(req.body);
  if (req.body.contactId !== userId) {
    try {
      const user = await User.findById({ _id: userId });
      const contact = await User.findById({ _id: req.body.contactId });

      if (user.contacts.includes(req.body.contactId)) {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $pull: { contacts: req.body.contactId } },
          { new: true }
        )
          .populate('contacts')
          .populate('receivedRequests')
          .populate('posts');
        const updatedContactUser = await User.findByIdAndUpdate(
          contact._id,
          { $pull: { contacts: userId } },
          { new: true }
        );
        console.log(updatedUser, updatedContactUser);
        return res.status(200).json({ user: updatedUser });
      } else {
        return res.status(403).json({ error: 'User is not a contact' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'error' });
    }
  } else {
    return res.status(403).json({ error: 'You can not delete yourself' });
  }
};

const acceptContactRequest = async (req, res) => {
  const userId = req.params.id;
  console.log('params', userId);
  console.log(req.body.reqUserId);
  if (req.body.reqUserId !== userId) {
    try {
      const user = await User.findById({ _id: userId });
      const contact = await User.findById({ _id: req.body.reqUserId });

      if (!user.receivedRequests.includes(req.body.reqUserId)) {
        return res.status(400).json({ error: 'User is not in your received requests' });
      }
      if (!contact.sentRequests.includes(userId)) {
        return res.status(400).json({ error: `You didn't send a request to this user` });
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $push: { contacts: req.body.reqUserId },
          $pull: {
            receivedRequests: req.body.reqUserId,
          },
        },
        {
          new: true,
        }
      )
        .populate('contacts')
        .populate('receivedRequests')
        .populate('posts');
      const updateContact = await User.findByIdAndUpdate(
        req.body.reqUserId,
        {
          $push: {
            contacts: userId,
          },
          $pull: {
            sentRequests: userId,
          },
        },
        { new: true }
      );

      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: 'Unexpected error' });
    }
  } else {
    return res.status(403).json({ error: 'You can not accept yourself' });
  }
};
const declineContactRequest = async (req, res) => {
  const userId = req.params.id;
  console.log('params', userId);
  console.log(req.body.reqUserId);
  if (req.body.reqUserId !== userId) {
    try {
      const user = await User.findById({ _id: userId });
      const contact = await User.findById({ _id: req.body.reqUserId });

      if (!user.receivedRequests.includes(req.body.reqUserId)) {
        return res.status(400).json({ error: 'User is not in your received requests' });
      }
      if (!contact.sentRequests.includes(userId)) {
        return res.status(400).json({ error: `You didn't send a request to this user` });
      }
      const updateUser = await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            receivedRequests: req.body.reqUserId,
          },
        },
        {
          new: true,
        }
      )
        .populate('contacts')
        .populate('receivedRequests')
        .populate('posts');
      const updateContact = await User.findByIdAndUpdate(
        req.body.reqUserId,
        {
          $pull: {
            sentRequests: userId,
          },
        },
        { new: true }
      );

      return res.status(200).json({ user: updateUser });
    } catch (error) {
      return res.status(500).json({ error: 'Unexpected error' });
    }
  } else {
    return res.status(403).json({ error: 'You can not accept yourself' });
  }
};
const removeMention = async (req, res) => {
  const { senderId } = req.body;
  const userId = req.params.id;
  console.log('body', req.body);

  console.log('sender; ', senderId, 'user; ', userId);
  if (!userId && !senderId) {
    return res.status(400).json({ error: 'User and sender ids needed' });
  }
  try {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      existingUser._id,
      {
        $pull: {
          mentions: senderId,
        },
      },
      {
        new: true,
      }
    );
    console.log('existingUser: ', existingUser);
    console.log('updatedUSer: ', updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};
module.exports = {
  passwordUpdate,
  fieldUpdate,
  userDelete,
  userGet,
  userGetAll,
  sendContactRequestUpdate,
  removeContactUpdate,
  acceptContactRequest,
  declineContactRequest,
  removeMention,
};
