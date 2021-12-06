const User = require('../models/User');
const Message = require('../models/Message');

//add message
const newMessage = async (req, res) => {
  const { conversationId, sender, text } = req.body;
  if (!sender) {
    return res.status(400).json({ error: 'User id needed' });
  }
  if (!conversationId) {
    return res.status(400).json({ error: 'Impossible to associate message to a conversation' });
  }
  try {
    const newMessage = await new Message({
      conversationId,
      sender,
      text,
    }).populate('sender');

    const savedNewMessage = await newMessage.save();

    return res.status(200).json(savedNewMessage);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

//get message

const getAllMessageByConversation = async (req, res) => {
  const { conversationId } = req.params;
  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation id needed' });
  }
  try {
    const messages = await Message.find({
      conversationId,
    }).populate('sender');
    if (!messages) {
      return res.status(404).json({ error: 'No messages associated to this conversation' });
    }
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

module.exports = { newMessage, getAllMessageByConversation };
