const router = require('express').Router();
const {
  passwordUpdate,
  fieldUpdate,
  userDelete,
  userGet,
  followUserUpdate,
  unfollowUserUpdate,
} = require('../controllers/user.controller');

router.put('/:id/password', passwordUpdate);

router.put('/:id', fieldUpdate);

router.delete('/:id', userDelete);

router.get('/:id', userGet);

router.put('/:id/follow', followUserUpdate);

router.put('/:id/unfollow', unfollowUserUpdate);

module.exports = router;
