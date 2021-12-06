const User = require('../models/User');
const Conversation = require('../models/Conversation');

//new conversation
const createConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId) {
    return res.status(400).json({ error: 'User id needed' });
  }
  try {
    const newConversation = await new Conversation({
      members: [senderId, receiverId],
    });

    const savedNewConversation = await newConversation.save();
    savedNewConversation.populate('members');

    return res.status(200).json(savedNewConversation);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

//get a conversation of user

const getConversationByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'User id needed' });
  }
  try {
    const existingConversation = await Conversation.find({
      members: {
        $in: [userId],
      },
    }).populate('members');
    if (!existingConversation) {
      return res.status(404).json({ error: `User doesn't have any conversation` });
    }
    return res.status(200).json(existingConversation);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};
//get all conversation of user

module.exports = { createConversation, getConversationByUserId };
