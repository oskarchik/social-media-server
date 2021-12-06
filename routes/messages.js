const router = require('express').Router();
const { newMessage, getAllMessageByConversation } = require('../controllers/message.controller');

router.post('/', newMessage);
router.get('/:conversationId', getAllMessageByConversation);

module.exports = router;
