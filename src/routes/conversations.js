const router = require('express').Router();
const {
  createConversation,
  getConversationByUserId,
  getConversationByMembersId,
} = require('../controllers/conversation.controller');

router.post('/', createConversation);

router.get('/:userId', getConversationByUserId);

router.get('/find/:firstUserId/:secondUserId', getConversationByMembersId);

module.exports = router;
