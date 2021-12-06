const router = require('express').Router();
const { createConversation, getConversationByUserId } = require('../controllers/conversation.controller');

router.post('/', createConversation);

router.get('/:userId', getConversationByUserId);

module.exports = router;
