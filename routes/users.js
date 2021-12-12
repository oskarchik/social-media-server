const router = require('express').Router();
const {
  passwordUpdate,
  fieldUpdate,
  userDelete,
  userGet,
  sendContactRequestUpdate,
  removeContactUpdate,
  userGetAll,
  acceptContactRequest,
  declineContactRequest,
  removeMention,
} = require('../controllers/user.controller');

router.put('/:id/password', passwordUpdate);

router.put('/:id', fieldUpdate);

router.delete('/:id', userDelete);

router.get('/:id', userGet);

router.put('/:id/request-contact', sendContactRequestUpdate);

router.put('/:id/remove-contact', removeContactUpdate);

router.put('/:id/accept-contact', acceptContactRequest);

router.put('/:id/decline-contact', declineContactRequest);

router.get('/', userGetAll);

router.put('/:id/mentions', removeMention);
module.exports = router;
